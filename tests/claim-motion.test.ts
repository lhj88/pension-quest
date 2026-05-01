import { describe, expect, it } from "vitest";

import { getClaimMotionClasses } from "@/app/claim/[code]/motion";

describe("getClaimMotionClasses", () => {
  it("uses celebratory motion for a new claim", () => {
    const classes = getClaimMotionClasses(false);

    expect(classes.card).toContain("claim-card-success");
    expect(classes.decoration).toBe("claim-card-shine");
    expect(classes.stats).toEqual([
      "claim-stat-reveal claim-stat-reveal-one",
      "claim-stat-reveal claim-stat-reveal-two",
    ]);
  });

  it("uses calmer motion for a duplicate claim", () => {
    const classes = getClaimMotionClasses(true);

    expect(classes.card).toContain("claim-card-duplicate");
    expect(classes.decoration).toBeNull();
  });
});
