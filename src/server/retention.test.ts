import { beforeEach, describe, expect, it, vi } from "vitest";
import { PENDING_RETENTION_MS, purgeUnconfirmed } from "./retention";
import { CONFIRM_TTL_MS } from "./subscription";
import * as repo from "./waitlist-repo";

vi.mock("./waitlist-repo", () => ({ deleteStalePending: vi.fn() }));

const now = new Date("2026-10-08T06:00:00Z");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("purgeUnconfirmed", () => {
  it("deletes pending signups created over 30 days ago whose link has expired", async () => {
    vi.mocked(repo.deleteStalePending).mockResolvedValue(4);

    expect(await purgeUnconfirmed(now)).toBe(4);
    expect(repo.deleteStalePending).toHaveBeenCalledWith({
      createdBefore: new Date("2026-09-08T06:00:00Z"),
      sentBefore: new Date("2026-10-05T06:00:00Z"),
    });
  });

  it("uses a 30-day retention and the 72-hour confirm link lifetime", () => {
    expect(PENDING_RETENTION_MS).toBe(30 * 24 * 60 * 60 * 1000);
    expect(CONFIRM_TTL_MS).toBe(72 * 60 * 60 * 1000);
  });

  it("passes database errors through", async () => {
    vi.mocked(repo.deleteStalePending).mockRejectedValue(new Error("db down"));

    await expect(purgeUnconfirmed(now)).rejects.toThrow("db down");
  });
});
