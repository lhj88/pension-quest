import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HuntItem } from "@/types/domain";

const mocks = vi.hoisted(() => ({
  getAllHuntItems: vi.fn(),
  toDataURL: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getAllHuntItems: mocks.getAllHuntItems,
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://pension-quest-chi.vercel.app",
}));

vi.mock("qrcode", () => ({
  default: {
    toDataURL: mocks.toDataURL,
  },
}));

vi.mock("next/image", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    default: ({
      alt,
      className,
      height,
      src,
      width,
    }: {
      alt: string;
      className?: string;
      height: number;
      src: string;
      width: number;
    }) =>
      React.createElement("img", {
        alt,
        className,
        height,
        src,
        width,
      }),
  };
});

const huntItems: HuntItem[] = [
  {
    id: "item-1",
    code: "PENSION-001",
    title: "비밀 선물 위치",
    description: "이 문구가 보이면 숨긴 장소를 바로 알 수 있습니다.",
    type: "bonus",
    points: 10,
    tickets: 2,
    is_active: true,
    sort_order: 10,
    created_at: "2026-05-01T00:00:00.000Z",
  },
];

describe("AdminQrPage", () => {
  beforeEach(() => {
    mocks.getAllHuntItems.mockResolvedValue(huntItems);
    mocks.toDataURL.mockResolvedValue("data:image/png;base64,qr-code");
  });

  it("prints only the QR code and URL for each hunt item", async () => {
    const { default: AdminQrPage } = await import(
      "@/app/admin/(protected)/qr/page"
    );

    const html = renderToStaticMarkup(await AdminQrPage());

    expect(html).toContain(
      "https://pension-quest-chi.vercel.app/claim/PENSION-001",
    );
    expect(html).not.toContain("비밀 선물 위치");
    expect(html).not.toContain("이 문구가 보이면 숨긴 장소를 바로 알 수 있습니다.");
    expect(html).not.toContain("보너스");
  });
});
