import { describe, expect, it } from "vitest";

import { buildDrawRevealSlides } from "@/app/results/reveal-items";
import type { SpecialClaimGroup } from "@/lib/special-claims";
import type { DrawResultView } from "@/types/domain";

const drawResult: DrawResultView = {
  id: "draw-1",
  prize_id: "prize-1",
  participant_id: "participant-1",
  position: 1,
  created_at: "2026-05-01T10:00:00.000Z",
  participant: {
    id: "participant-1",
    name: "지수",
    client_token: "token-1",
    created_at: "2026-05-01T09:00:00.000Z",
  },
  prize: {
    id: "prize-1",
    name: "1등 상품",
    description: "오늘의 메인 보상입니다.",
    quantity: 1,
    is_active: true,
    sort_order: 10,
    created_at: "2026-05-01T09:30:00.000Z",
  },
};

const specialClaimGroups: SpecialClaimGroup[] = [
  {
    type: "mission",
    claims: [
      {
        id: "mission-claim",
        participantName: "민준",
        itemTitle: "뒷정리 MVP 후보",
        itemDescription: "오늘의 뒷정리 후보에 등록되었습니다.",
        tickets: 0,
        claimedAt: "2026-05-01T10:03:00.000Z",
      },
    ],
  },
  {
    type: "bonus",
    claims: [
      {
        id: "bonus-claim",
        participantName: "서연",
        itemTitle: "축하의 박수",
        itemDescription: "응모권 1장 추가!",
        tickets: 1,
        claimedAt: "2026-05-01T10:01:00.000Z",
      },
    ],
  },
  {
    type: "blank",
    claims: [
      {
        id: "blank-claim",
        participantName: "도윤",
        itemTitle: "아쉽지만 꽝",
        itemDescription: "아무 일도 일어나지 않았습니다.",
        tickets: 0,
        claimedAt: "2026-05-01T10:02:00.000Z",
      },
    ],
  },
];

describe("buildDrawRevealSlides", () => {
  it("adds one blank screen and one bonus screen after prize result screens", () => {
    const slides = buildDrawRevealSlides([drawResult], specialClaimGroups);

    expect(
      slides.map((slide) =>
        slide.kind === "prize" ? slide.id : `special-${slide.type}`,
      ),
    ).toEqual(["draw-1", "special-blank", "special-bonus"]);
    expect(slides[1]).toMatchObject({
      kind: "special-group",
      type: "blank",
      claims: [{ participantName: "도윤", itemTitle: "아쉽지만 꽝" }],
    });
    expect(slides[2]).toMatchObject({
      kind: "special-group",
      type: "bonus",
      claims: [{ participantName: "서연", itemTitle: "축하의 박수" }],
    });
  });

  it("shows blank and bonus screens even when there are no prize results", () => {
    const slides = buildDrawRevealSlides([], specialClaimGroups);

    expect(slides.map((slide) => slide.kind)).toEqual([
      "special-group",
      "special-group",
    ]);
    expect(
      slides.map((slide) =>
        slide.kind === "special-group" ? slide.type : slide.kind,
      ),
    ).toEqual(["blank", "bonus"]);
  });
});
