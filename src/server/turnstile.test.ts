import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "./turnstile";

const fetchMock = vi.fn();

function respond(body: Record<string, unknown>) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body)));
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("TURNSTILE_SECRET_KEY", "secret");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ekklesiaio.com");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  fetchMock.mockReset();
});

describe("verifyTurnstile", () => {
  it("posts the secret, token and IP to siteverify", async () => {
    respond({ success: true, hostname: "example.com" });

    expect(await verifyTurnstile("tok", "203.0.113.7")).toBe(true);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = init.body as URLSearchParams;
    expect(Object.fromEntries(body)).toEqual({
      secret: "secret",
      response: "tok",
      remoteip: "203.0.113.7",
    });
  });

  it("fails closed without a secret, without a token, on rejection or network error", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(await verifyTurnstile("tok", null)).toBe(false);

    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret");
    expect(await verifyTurnstile(undefined, null)).toBe(false);

    respond({ success: false, "error-codes": ["timeout-or-duplicate"] });
    expect(await verifyTurnstile("tok", null)).toBe(false);

    fetchMock.mockRejectedValue(new Error("network"));
    expect(await verifyTurnstile("tok", null)).toBe(false);
  });

  it("skips the hostname check outside Vercel production (test keys)", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    respond({ success: true, hostname: "example.com" });

    expect(await verifyTurnstile("tok", null)).toBe(true);
  });

  it("in production, accepts only tokens issued on the site host", async () => {
    vi.stubEnv("VERCEL_ENV", "production");

    respond({ success: true, hostname: "ekklesiaio.com" });
    expect(await verifyTurnstile("tok", null)).toBe(true);

    respond({ success: true, hostname: "evil.example" });
    expect(await verifyTurnstile("tok", null)).toBe(false);

    respond({ success: true });
    expect(await verifyTurnstile("tok", null)).toBe(false);
  });
});
