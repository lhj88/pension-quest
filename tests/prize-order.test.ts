import { describe, expect, it } from "vitest";

import {
  createPrizeSortOrderUpdates,
  reorderPrizeIds,
} from "@/lib/prize-order";

describe("reorderPrizeIds", () => {
  it("moves the dragged prize to the drop target slot", () => {
    const reordered = reorderPrizeIds(["first", "second", "third"], {
      activeId: "third",
      overId: "first",
    });

    expect(reordered).toEqual(["third", "first", "second"]);
  });

  it("leaves the order unchanged when the drag target is invalid", () => {
    const original = ["first", "second", "third"];

    const reordered = reorderPrizeIds(original, {
      activeId: "missing",
      overId: "first",
    });

    expect(reordered).toEqual(original);
  });
});

describe("createPrizeSortOrderUpdates", () => {
  it("creates stable ten-step sort_order updates", () => {
    const updates = createPrizeSortOrderUpdates(["third", "first", "second"]);

    expect(updates).toEqual([
      { id: "third", sort_order: 10 },
      { id: "first", sort_order: 20 },
      { id: "second", sort_order: 30 },
    ]);
  });
});
