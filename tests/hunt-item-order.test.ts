import { describe, expect, it } from "vitest";

import {
  createHuntItemSortOrderUpdates,
  reorderHuntItemIds,
} from "@/lib/hunt-item-order";

describe("reorderHuntItemIds", () => {
  it("moves an item before the hovered item", () => {
    expect(
      reorderHuntItemIds(["first", "second", "third"], {
        activeId: "third",
        overId: "first",
      }),
    ).toEqual(["third", "first", "second"]);
  });

  it("keeps order when ids are missing", () => {
    expect(
      reorderHuntItemIds(["first", "second"], {
        activeId: "missing",
        overId: "first",
      }),
    ).toEqual(["first", "second"]);
  });
});

describe("createHuntItemSortOrderUpdates", () => {
  it("creates stable sort order updates and removes duplicate ids", () => {
    expect(createHuntItemSortOrderUpdates(["a", "b", "a", "c"])).toEqual([
      { id: "a", sort_order: 10 },
      { id: "b", sort_order: 20 },
      { id: "c", sort_order: 30 },
    ]);
  });
});
