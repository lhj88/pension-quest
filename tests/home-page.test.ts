import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("Home", () => {
  it("renders a poster-style entry screen without a participant name form", async () => {
    const { default: Home } = await import("@/app/page");

    const html = renderToStaticMarkup(Home());

    expect(html).toContain("QR 찾고");
    expect(html).toContain("응모권 모으기");
    expect(html).toContain("추첨 받기");
    expect(html).not.toContain("참가자 이름");
    expect(html).not.toContain("참가 시작하기");
    expect(html).not.toContain("결과 보기");
    expect(html).not.toContain('href="/results"');
    expect(html).not.toContain('name="name"');
  });
});
