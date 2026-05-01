import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("claim result actions", () => {
  it("renders only the close action on the claim result page", async () => {
    const source = await readFile("app/claim/[code]/page.tsx", "utf8");

    expect(source).not.toContain("다른 이름으로 다시 입력");
    expect(source).not.toContain("결과 화면 보기");
    expect(source).toContain("<CloseClaimButton");
  });

  it("closes the current browser window from the close button", async () => {
    const source = await readFile("app/claim/[code]/close-button.tsx", "utf8");

    expect(source).toContain("use client");
    expect(source).toContain("window.close()");
    expect(source).toContain("window.history.back()");
    expect(source).toContain("닫기");
  });
});
