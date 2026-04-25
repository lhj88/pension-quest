import { describe, expect, it } from "vitest";

import {
  getRevealNavigationIntent,
  shouldRevealSecondPartForKey,
} from "@/app/results/reveal-flow";

describe("shouldRevealSecondPartForKey", () => {
  it("allows Enter and Space to reveal the second draw detail", () => {
    expect(shouldRevealSecondPartForKey("Enter")).toBe(true);
    expect(shouldRevealSecondPartForKey(" ")).toBe(true);
    expect(shouldRevealSecondPartForKey("Spacebar")).toBe(true);
  });

  it("ignores navigation and letter keys", () => {
    expect(shouldRevealSecondPartForKey("ArrowRight")).toBe(false);
    expect(shouldRevealSecondPartForKey("a")).toBe(false);
  });
});

describe("getRevealNavigationIntent", () => {
  it("maps horizontal arrow keys to reveal navigation actions", () => {
    expect(getRevealNavigationIntent("ArrowLeft")).toBe("previous");
    expect(getRevealNavigationIntent("ArrowRight")).toBe("next");
  });

  it("ignores reveal and vertical navigation keys", () => {
    expect(getRevealNavigationIntent("Enter")).toBe(null);
    expect(getRevealNavigationIntent(" ")).toBe(null);
    expect(getRevealNavigationIntent("ArrowUp")).toBe(null);
    expect(getRevealNavigationIntent("ArrowDown")).toBe(null);
  });
});
