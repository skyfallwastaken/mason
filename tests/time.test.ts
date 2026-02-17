import { describe, expect, it } from "bun:test";
import { DateTime } from "luxon";

import { millisecondsUntilNextMidnight } from "../src/summary/time";

describe("millisecondsUntilNextMidnight", () => {
  it("returns one hour when it is 23:00 in London", () => {
    const now = DateTime.fromISO("2026-02-17T23:00:00", { zone: "Europe/London" });
    const ms = millisecondsUntilNextMidnight(now, "Europe/London");
    expect(ms).toBe(60 * 60 * 1000);
  });

  it("handles timezone conversion from UTC input", () => {
    const now = DateTime.fromISO("2026-02-17T22:30:00Z", { zone: "UTC" });
    const ms = millisecondsUntilNextMidnight(now, "Europe/London");
    expect(ms).toBe(90 * 60 * 1000);
  });
});
