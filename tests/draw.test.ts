import { describe, expect, it } from "vitest";

import { selectWeightedWinners, sortPrizesForDraw } from "@/lib/draw";

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

describe("sortPrizesForDraw", () => {
  const prizes = [
    {
      id: "late",
      name: "늦게 뽑을 상품",
      description: "",
      quantity: 1,
      is_active: true,
      sort_order: 30,
      created_at: "2026-04-24T00:03:00.000Z",
    },
    {
      id: "early",
      name: "먼저 뽑을 상품",
      description: "",
      quantity: 1,
      is_active: true,
      sort_order: 10,
      created_at: "2026-04-24T00:02:00.000Z",
    },
    {
      id: "middle",
      name: "가운데 상품",
      description: "",
      quantity: 1,
      is_active: true,
      sort_order: 20,
      created_at: "2026-04-24T00:01:00.000Z",
    },
  ];

  it("orders prizes by draw order", () => {
    const ordered = sortPrizesForDraw(prizes);

    expect(ordered.map((prize) => prize.id)).toEqual([
      "early",
      "middle",
      "late",
    ]);
  });

  it("keeps older prize first when draw order matches", () => {
    const ordered = sortPrizesForDraw([
      { ...prizes[0], id: "newer", sort_order: 10 },
      { ...prizes[1], id: "older", sort_order: 10 },
    ]);

    expect(ordered.map((prize) => prize.id)).toEqual(["older", "newer"]);
  });
});
