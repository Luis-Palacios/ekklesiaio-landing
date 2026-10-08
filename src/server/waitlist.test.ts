import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WaitlistSignup } from "./db/schema";
import { sendConfirmationEmail } from "./email/send-confirmation";
import { hashToken } from "./tokens";
import { addToWaitlist, RESEND_INTERVAL_MS } from "./waitlist";
import * as repo from "./waitlist-repo";

vi.mock("./waitlist-repo", () => ({
  findSignup: vi.fn(),
  insertSignup: vi.fn(),
  claimConfirmationSend: vi.fn(),
  resetConfirmSentAt: vi.fn(),
}));
vi.mock("./email/send-confirmation", () => ({ sendConfirmationEmail: vi.fn() }));

const now = new Date("2026-10-08T12:00:00Z");
const input = { email: "a@b.org", locale: "es", source: "hero" } as const;

function row(overrides: Partial<WaitlistSignup>): WaitlistSignup {
  return {
    id: "id-1",
    email: "a@b.org",
    locale: "en",
    source: "cta",
    status: "pending",
    confirmTokenHash: "old-hash",
    confirmSentAt: new Date(now.getTime() - RESEND_INTERVAL_MS - 1000),
    confirmedAt: null,
    unsubscribeToken: "unsub-1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("addToWaitlist", () => {
  it("new email: inserts pending with a hashed token and sends the email", async () => {
    vi.mocked(repo.findSignup).mockResolvedValue(undefined);
    vi.mocked(repo.insertSignup).mockResolvedValue("new-id");

    await addToWaitlist(input, now);

    const inserted = vi.mocked(repo.insertSignup).mock.calls[0]![0];
    const sent = vi.mocked(sendConfirmationEmail).mock.calls[0]![0];
    expect(inserted).toMatchObject({ ...input, confirmSentAt: now });
    expect(sent).toMatchObject({ to: input.email, locale: "es" });
    expect(inserted.confirmTokenHash).toBe(hashToken(sent.confirmToken));
    expect(inserted.confirmTokenHash).not.toBe(sent.confirmToken);
    expect(sent.unsubscribeToken).toBe(inserted.unsubscribeToken);
  });

  it("new email that loses an insert race: continues as the existing signup", async () => {
    vi.mocked(repo.findSignup)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(row({ status: "confirmed" }));
    vi.mocked(repo.insertSignup).mockResolvedValue(null);

    await addToWaitlist(input, now);

    expect(repo.claimConfirmationSend).not.toHaveBeenCalled();
    expect(sendConfirmationEmail).not.toHaveBeenCalled();
  });

  it("pending, last email over 10 minutes ago: rotates the token and resends", async () => {
    vi.mocked(repo.findSignup).mockResolvedValue(row({ status: "pending" }));
    vi.mocked(repo.claimConfirmationSend).mockResolvedValue(true);

    await addToWaitlist(input, now);

    const claim = vi.mocked(repo.claimConfirmationSend).mock.calls[0]![0];
    const sent = vi.mocked(sendConfirmationEmail).mock.calls[0]![0];
    expect(claim).toMatchObject({ id: "id-1", fromStatus: "pending", locale: "es", now });
    expect(claim.sentBefore).toEqual(new Date(now.getTime() - RESEND_INTERVAL_MS));
    expect(claim.confirmTokenHash).toBe(hashToken(sent.confirmToken));
    expect(sent.unsubscribeToken).toBe("unsub-1");
  });

  it("pending, emailed within 10 minutes: the claim fails and nothing is sent", async () => {
    vi.mocked(repo.findSignup).mockResolvedValue(row({ status: "pending", confirmSentAt: now }));
    vi.mocked(repo.claimConfirmationSend).mockResolvedValue(false);

    await addToWaitlist(input, now);

    expect(sendConfirmationEmail).not.toHaveBeenCalled();
  });

  it("confirmed: does nothing", async () => {
    vi.mocked(repo.findSignup).mockResolvedValue(row({ status: "confirmed" }));

    await addToWaitlist(input, now);

    expect(repo.claimConfirmationSend).not.toHaveBeenCalled();
    expect(sendConfirmationEmail).not.toHaveBeenCalled();
  });

  it("unsubscribed: moves back to pending without the resend throttle and sends", async () => {
    vi.mocked(repo.findSignup).mockResolvedValue(
      row({ status: "unsubscribed", confirmSentAt: now }),
    );
    vi.mocked(repo.claimConfirmationSend).mockResolvedValue(true);

    await addToWaitlist(input, now);

    const claim = vi.mocked(repo.claimConfirmationSend).mock.calls[0]![0];
    expect(claim).toMatchObject({ fromStatus: "unsubscribed", sentBefore: undefined });
    expect(sendConfirmationEmail).toHaveBeenCalledOnce();
  });

  it("send failure: restores the previous send time and rethrows", async () => {
    const previous = new Date(now.getTime() - RESEND_INTERVAL_MS * 2);
    vi.mocked(repo.findSignup).mockResolvedValue(row({ confirmSentAt: previous }));
    vi.mocked(repo.claimConfirmationSend).mockResolvedValue(true);
    vi.mocked(sendConfirmationEmail).mockRejectedValue(new Error("resend down"));
    vi.mocked(repo.resetConfirmSentAt).mockResolvedValue();

    await expect(addToWaitlist(input, now)).rejects.toThrow("resend down");
    expect(repo.resetConfirmSentAt).toHaveBeenCalledWith("id-1", previous);
  });
});
