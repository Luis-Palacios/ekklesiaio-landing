import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hashToken } from "../tokens";
import { sendConfirmationEmail } from "./send-confirmation";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const email = {
  to: "a@b.org",
  locale: "es",
  confirmToken: "confirm-token",
  unsubscribeToken: "unsub-token",
} as const;

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "email-1" }, error: null });
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ekklesiaio.com");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("EMAIL_FROM", "ekklesiaio <hello@ekklesiaio.com>");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sendConfirmationEmail", () => {
  it("sends the email in the signup's locale, with one-click unsubscribe headers", async () => {
    await sendConfirmationEmail(email);

    const [payload, options] = send.mock.calls[0]!;
    expect(payload).toMatchObject({
      from: "ekklesiaio <hello@ekklesiaio.com>",
      to: "a@b.org",
      subject: "Confirme su lugar en la lista de espera de ekklesiaio",
      headers: {
        "List-Unsubscribe": "<https://ekklesiaio.com/api/unsubscribe?locale=es&token=unsub-token>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    expect(options).toEqual({ idempotencyKey: `confirm-email/${hashToken("confirm-token")}` });

    expect(payload.html).toContain('lang="es"');
    expect(payload.html).toContain('href="https://ekklesiaio.com/es/confirm?token=confirm-token"');
    expect(payload.html).toContain(
      'href="https://ekklesiaio.com/es/unsubscribe?token=unsub-token"',
    );
    expect(payload.html).toContain("Confirmar mi correo");
    expect(payload.html).toContain("Un clic para confirmar su correo.");
    expect(payload.text).toContain("Gracias por su interés en ekklesiaio.");
    expect(payload.text).toContain("https://ekklesiaio.com/es/confirm?token=confirm-token");
  });

  it("throws when Resend returns an error, so the action reports a failure", async () => {
    send.mockResolvedValue({ data: null, error: { name: "validation_error", message: "bad" } });

    await expect(sendConfirmationEmail(email)).rejects.toThrow("validation_error");
  });

  it("in dev without an API key, logs the confirm link instead of sending", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await sendConfirmationEmail(email);

    expect(send).not.toHaveBeenCalled();
    expect(info.mock.calls[0]![0]).toContain("/es/confirm?token=confirm-token");
    info.mockRestore();
  });

  it("in production without an API key, fails closed", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("NODE_ENV", "production");

    await expect(sendConfirmationEmail(email)).rejects.toThrow("RESEND_API_KEY");
    expect(send).not.toHaveBeenCalled();
  });
});
