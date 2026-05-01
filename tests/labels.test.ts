import { describe, expect, it } from "vitest";

import { itemTypeLabel } from "@/lib/labels";

describe("itemTypeLabel", () => {
  it("labels mission QR items as jokes for this trip", () => {
    expect(itemTypeLabel("mission")).toBe("장난");
  });
});
