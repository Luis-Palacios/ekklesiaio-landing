import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkUnsubscribeToken,
  confirmSubscription,
  CONFIRM_TTL_MS,
  unsubscribe,
} from "./subscription";
import { createToken, hashToken } from "./tokens";
import * as repo from "./waitlist-repo";

vi.mock("./waitlist-repo", () => ({
  confirmPending: vi.fn(),
  findStatusByConfirmHash: vi.fn(),
  findStatusByUnsubscribeToken: vi.fn(),
  unsubscribeByToken: vi.fn(),
}));

const now = new Date("2026-10-08T12:00:00Z");
const token = createToken();

beforeEach(() => {
  vi.resetAllMocks();
});

describe("confirmSubscription", () => {
  it("confirms a pending signup by token hash, within 72 hours", async () => {
    vi.mocked(repo.confirmPending).mockResolvedValue(true);

    expect(await confirmSubscription(token, now)).toBe(true);
    expect(repo.confirmPending).toHaveBeenCalledWith({
      confirmTokenHash: hashToken(token),
      sentAfter: new Date(now.getTime() - CONFIRM_TTL_MS),
      now,
    });
  });

  it("an already-confirmed link still reports confirmed (scanner clicked first)", async () => {
    vi.mocked(repo.confirmPending).mockResolvedValue(false);
    vi.mocked(repo.findStatusByConfirmHash).mockResolvedValue("confirmed");

    expect(await confirmSubscription(token, now)).toBe(true);
  });

  it("an expired pending link is invalid", async () => {
    vi.mocked(repo.confirmPending).mockResolvedValue(false);
    vi.mocked(repo.findStatusByConfirmHash).mockResolvedValue("pending");

    expect(await confirmSubscription(token, now)).toBe(false);
  });

  it("an unknown token is invalid", async () => {
    vi.mocked(repo.confirmPending).mockResolvedValue(false);
    vi.mocked(repo.findStatusByConfirmHash).mockResolvedValue(undefined);

    expect(await confirmSubscription(token, now)).toBe(false);
  });

  it.each([undefined, "", "short", `${token}x`, ["a", "b"]])(
    "a malformed token (%j) is invalid without a DB call",
    async (value) => {
      expect(await confirmSubscription(value, now)).toBe(false);
      expect(repo.confirmPending).not.toHaveBeenCalled();
    },
  );
});

describe("checkUnsubscribeToken", () => {
  it.each([
    ["pending", "valid"],
    ["confirmed", "valid"],
    ["unsubscribed", "done"],
    [undefined, "invalid"],
  ] as const)("status %s → %s", async (status, expected) => {
    vi.mocked(repo.findStatusByUnsubscribeToken).mockResolvedValue(status);
    expect(await checkUnsubscribeToken(token)).toBe(expected);
  });

  it("a malformed token is invalid without a DB call", async () => {
    expect(await checkUnsubscribeToken("nope")).toBe("invalid");
    expect(repo.findStatusByUnsubscribeToken).not.toHaveBeenCalled();
  });
});

describe("unsubscribe", () => {
  it("unsubscribes by token", async () => {
    vi.mocked(repo.unsubscribeByToken).mockResolvedValue(true);

    expect(await unsubscribe(token, now)).toBe(true);
    expect(repo.unsubscribeByToken).toHaveBeenCalledWith(token, now);
  });

  it("a malformed token does nothing", async () => {
    expect(await unsubscribe(null, now)).toBe(false);
    expect(repo.unsubscribeByToken).not.toHaveBeenCalled();
  });
});
