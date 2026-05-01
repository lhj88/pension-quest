import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("reveal fullscreen layout", () => {
  it("uses dedicated fullscreen layout hooks for the stage and controls", async () => {
    const source = await readFile("app/results/draw-reveal.tsx", "utf8");

    expect(source).toContain("draw-reveal-stage");
    expect(source).toContain("draw-reveal-content");
    expect(source).toContain("draw-reveal-controls");
  });

  it("keeps fullscreen controls compact after reveal starts", async () => {
    const css = await readFile("app/globals.css", "utf8");

    expect(css).toContain(".draw-reveal-layer:fullscreen");
    expect(css).toContain(".draw-reveal-controls");
    expect(css).toContain(".draw-reveal-controls button:first-child:disabled");
    expect(css).not.toContain("sm:grid-cols-[1fr_auto_auto_auto]");
  });
});
