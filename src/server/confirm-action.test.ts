import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmAction } from "./confirm-action";
import { confirmSubscription } from "./subscription";
import { createToken } from "./tokens";

// redirect() throws in Next; record the target the same way.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Redirect(url);
  }),
}));
vi.mock("./subscription", () => ({ confirmSubscription: vi.fn() }));

class Redirect extends Error {
  constructor(readonly url: string) {
    super(`redirect ${url}`);
  }
}

const token = createToken();

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ locale: "es", token, ...fields })) {
    data.set(key, value);
  }
  return data;
}

async function redirectOf(data: FormData) {
  const error = await confirmAction(data).then(
    () => undefined,
    (err: unknown) => err,
  );
  if (!(error instanceof Redirect)) throw new Error("expected a redirect");
  return error.url;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("confirmAction", () => {
  it("confirms the posted token and redirects to success", async () => {
    vi.mocked(confirmSubscription).mockResolvedValue(true);

    expect(await redirectOf(form({}))).toBe("/es/confirm/success");
    expect(confirmSubscription).toHaveBeenCalledWith(token);
  });

  it("an invalid or expired token redirects to invalid", async () => {
    vi.mocked(confirmSubscription).mockResolvedValue(false);

    expect(await redirectOf(form({}))).toBe("/es/confirm/invalid");
  });

  it("a tampered locale falls back to the default", async () => {
    vi.mocked(confirmSubscription).mockResolvedValue(true);

    expect(await redirectOf(form({ locale: "fr" }))).toBe("/en/confirm/success");
  });

  it("a failure goes back to the confirm page with the token and an error flag", async () => {
    vi.mocked(confirmSubscription).mockRejectedValue(new Error("db down"));

    const url = new URL(await redirectOf(form({})), "https://example.com");
    expect(url.pathname).toBe("/es/confirm");
    expect(url.searchParams.get("token")).toBe(token);
    expect(url.searchParams.get("error")).toBe("1");
  });

  it("a failure with a malformed token doesn't echo it back", async () => {
    vi.mocked(confirmSubscription).mockRejectedValue(new Error("db down"));

    expect(await redirectOf(form({ token: "<script>" }))).toBe("/es/confirm?error=1");
  });
});
