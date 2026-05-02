import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { DrawRevealSlide } from "@/app/results/reveal-items";

vi.mock("next/image", () => ({
  default: ({
    alt,
    className,
    height,
    priority,
    src,
    width,
  }: {
    alt: string;
    className?: string;
    height: number;
    priority?: boolean;
    src: string;
    width: number;
  }) =>
    React.createElement("img", {
      alt,
      className,
      "data-priority": priority ? "true" : undefined,
      height,
      src,
      width,
    }),
}));

const slides: DrawRevealSlide[] = [
  {
    id: "draw-1",
    kind: "prize",
    participantName: "지수",
    position: 1,
    prizeDescription: "오늘의 상품입니다.",
    prizeName: "1등 상품",
  },
];

describe("results opening screen", () => {
  it("keeps the opening image out of the pre-start waiting screen", async () => {
    const { DrawReveal } = await import("@/app/results/draw-reveal");

    const html = renderToStaticMarkup(
      React.createElement(DrawReveal, { slides }),
    );

    expect(html).toContain("공개 대기");
    expect(html).not.toContain("/results-opening.png");
    expect(html).not.toContain("유난히 내성적이었던 어릴 적 우리들");
  });

  it("renders the supplied poster image on the opening screen", async () => {
    const { ResultsOpeningPanel } = await import("@/app/results/draw-reveal");

    const html = renderToStaticMarkup(
      React.createElement(ResultsOpeningPanel),
    );

    expect(await readFile("public/results-opening.png")).toBeTruthy();
    expect(html).toContain("결과 공개 준비");
    expect(html).toContain("/results-opening.png");
    expect(html).toContain("유난히 내성적이었던 어릴 적 우리들");
    expect(html).toContain("max-w-5xl");
    expect(html).toContain("max-h-[min(74vh,52rem)]");
  });
});
