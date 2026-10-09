import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { purgeUnconfirmed } from "@/server/retention";
import { GET } from "./route";

vi.mock("@/server/retention", () => ({ purgeUnconfirmed: vi.fn() }));

const SECRET = "test-cron-secret-0123456789";

function call(authorization?: string) {
  const headers = authorization ? { authorization } : undefined;
  return GET(new Request("https://ekklesiaio.com/api/cron/purge-pending", { headers }));
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CRON_SECRET", SECRET);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("GET /api/cron/purge-pending", () => {
  it("purges with the right bearer secret and logs the count", async () => {
    vi.mocked(purgeUnconfirmed).mockResolvedValue(3);

    const response = await call(`Bearer ${SECRET}`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: 3 });
    expect(console.log).toHaveBeenCalledWith(
      "[cron] purge-pending: deleted 3 unconfirmed signup(s)",
    );
  });

  it.each([
    ["no header", undefined],
    ["a wrong secret", "Bearer not-the-secret"],
    ["the secret without Bearer", SECRET],
    ["an empty bearer", "Bearer "],
  ])("rejects %s", async (_, authorization) => {
    const response = await call(authorization);

    expect(response.status).toBe(401);
    expect(purgeUnconfirmed).not.toHaveBeenCalled();
  });

  it("refuses everything when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");

    for (const authorization of [undefined, "Bearer ", "Bearer undefined"]) {
      expect((await call(authorization)).status).toBe(401);
    }
    expect(purgeUnconfirmed).not.toHaveBeenCalled();
  });

  it("answers 500 and logs when the purge fails", async () => {
    vi.mocked(purgeUnconfirmed).mockRejectedValue(new Error("db down"));

    const response = await call(`Bearer ${SECRET}`);

    expect(response.status).toBe(500);
    expect(console.error).toHaveBeenCalled();
  });
});
