import { describe, expect, it } from "vitest";

import { summarizeClaims } from "@/lib/stats";

describe("summarizeClaims", () => {
  it("aggregates score, tickets, and item type counts", () => {
    const summary = summarizeClaims([
      { points: 10, tickets: 1, type: "normal" },
      { points: 25, tickets: 3, type: "bonus" },
      { points: 0, tickets: 0, type: "blank" },
      { points: 20, tickets: 2, type: "mission" },
    ]);

    expect(summary).toEqual({
      score: 55,
      tickets: 6,
      claimCount: 4,
      byType: {
        normal: 1,
        bonus: 1,
        blank: 1,
        mission: 1,
      },
    });
  });
});
