import { describe, expect, it } from "vitest";
import { emailSchema, waitlistSchema } from "./waitlist-schema";

describe("emailSchema", () => {
  it("trims and lowercases", () => {
    expect(emailSchema.parse("  Pastor@GraceChurch.org ")).toBe("pastor@gracechurch.org");
  });

  it.each(["", "pastor", "pastor@gracechurch", "pastor@", "@gracechurch.org", "a b@c.org"])(
    "rejects %j",
    (value) => {
      expect(emailSchema.safeParse(value).success).toBe(false);
    },
  );

  it("rejects addresses over 254 characters", () => {
    expect(emailSchema.safeParse(`${"a".repeat(250)}@x.org`).success).toBe(false);
  });
});

describe("waitlistSchema", () => {
  const valid = { email: "a@b.org", locale: "es", source: "cta" };

  it("accepts a minimal submission", () => {
    expect(waitlistSchema.parse(valid)).toEqual(valid);
  });

  it("rejects an unknown locale or source", () => {
    expect(waitlistSchema.safeParse({ ...valid, locale: "fr" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ ...valid, source: "footer" }).success).toBe(false);
  });
});
