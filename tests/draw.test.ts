import { describe, expect, it } from "vitest";

import { selectWeightedWinners } from "@/lib/draw";

const participants = [
  { id: "alice", name: "앨리스", tickets: 1 },
  { id: "bori", name: "보리", tickets: 3 },
  { id: "zero", name: "제로", tickets: 0 },
];

describe("selectWeightedWinners", () => {
  it("uses ticket counts as draw weight", () => {
    const winners = selectWeightedWinners({
      participants,
      totalSlots: 1,
      allowDuplicateWinners: true,
      rng: () => 0.4,
    });

    expect(winners).toEqual([{ id: "bori", name: "보리", tickets: 3 }]);
  });

  it("does not select the same participant twice when duplicates are disabled", () => {
    const winners = selectWeightedWinners({
      participants,
      totalSlots: 2,
      allowDuplicateWinners: false,
      rng: () => 0.99,
    });

    expect(winners.map((winner) => winner.id)).toEqual(["bori", "alice"]);
  });

  it("excludes participants with zero tickets from the pool", () => {
    const winners = selectWeightedWinners({
      participants,
      totalSlots: 5,
      allowDuplicateWinners: false,
      rng: () => 0.99,
    });

    expect(winners.map((winner) => winner.id)).not.toContain("zero");
  });
});
