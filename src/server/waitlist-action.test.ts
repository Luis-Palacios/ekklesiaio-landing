import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "./ratelimit";
import { verifyTurnstile } from "./turnstile";
import { addToWaitlist } from "./waitlist";
import { joinWaitlist } from "./waitlist-action";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }),
}));
vi.mock("./turnstile", () => ({ verifyTurnstile: vi.fn() }));
vi.mock("./ratelimit", () => ({ checkRateLimit: vi.fn() }));
vi.mock("./waitlist", () => ({ addToWaitlist: vi.fn() }));

const idle = { status: "idle" } as const;

function form(fields: Record<string, string>) {
  const data = new FormData();
  const all = { locale: "en", source: "hero", "cf-turnstile-response": "tok", ...fields };
  for (const [key, value] of Object.entries(all)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(verifyTurnstile).mockResolvedValue(true);
  vi.mocked(checkRateLimit).mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("joinWaitlist", () => {
  it("valid submission: normalizes the email and adds it", async () => {
    const result = await joinWaitlist(idle, form({ email: " A@B.org " }));

    expect(result).toEqual({ status: "success" });
    expect(verifyTurnstile).toHaveBeenCalledWith("tok", "203.0.113.7");
    expect(checkRateLimit).toHaveBeenCalledWith("203.0.113.7");
    expect(addToWaitlist).toHaveBeenCalledWith({ email: "a@b.org", locale: "en", source: "hero" });
  });

  it("invalid email: returns invalid with what was typed", async () => {
    const result = await joinWaitlist(idle, form({ email: "pastor@gracechurch" }));

    expect(result).toEqual({ status: "invalid", email: "pastor@gracechurch" });
    expect(addToWaitlist).not.toHaveBeenCalled();
  });

  it("tampered hidden field: returns error", async () => {
    const result = await joinWaitlist(idle, form({ email: "a@b.org", locale: "fr" }));

    expect(result).toEqual({ status: "error", email: "a@b.org" });
    expect(addToWaitlist).not.toHaveBeenCalled();
  });

  it("honeypot filled: fakes success and skips everything", async () => {
    const result = await joinWaitlist(idle, form({ email: "a@b.org", company: "Acme" }));

    expect(result).toEqual({ status: "success" });
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(addToWaitlist).not.toHaveBeenCalled();
  });

  it("Turnstile fails: returns error", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(false);

    const result = await joinWaitlist(idle, form({ email: "a@b.org" }));

    expect(result).toEqual({ status: "error", email: "a@b.org" });
    expect(addToWaitlist).not.toHaveBeenCalled();
  });

  it("rate limited: returns error", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(false);

    const result = await joinWaitlist(idle, form({ email: "a@b.org" }));

    expect(result).toEqual({ status: "error", email: "a@b.org" });
    expect(addToWaitlist).not.toHaveBeenCalled();
  });

  it("DB or email failure: returns error", async () => {
    vi.mocked(addToWaitlist).mockRejectedValue(new Error("db down"));

    const result = await joinWaitlist(idle, form({ email: "a@b.org" }));

    expect(result).toEqual({ status: "error", email: "a@b.org" });
  });
});
