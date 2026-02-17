import { describe, expect, it } from "bun:test";

import { buildDailySummaryText } from "../src/summary/build-summary-copy";

describe("buildDailySummaryText", () => {
  it("renders headline counts and leaderboard", () => {
    const text = buildDailySummaryText({
      openedCount: 68,
      closedCount: 54,
      assignedOpenCount: 5,
      openCount: 9,
      leaderboard: [
        { userId: "U1", closedCount: 16 },
        { userId: "U2", closedCount: 11 },
      ],
      staleTickets: [
        {
          title: "Old ticket",
          createdAt: new Date("2026-02-07T00:00:00Z"),
          lastActivityAt: new Date("2026-02-08T00:00:00Z"),
        },
      ],
    });

    expect(text).toContain("68 total tickets were opened");
    expect(text).toContain("you managed to close 54");
    expect(text).toContain("1. <@U1> - 16 closed tickets");
    expect(text).toContain("2. <@U2> - 11 closed tickets");
    expect(text).toContain("Old ticket");
  });
});
