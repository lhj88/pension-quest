import { describe, expect, it } from "vitest";

import { buildSpecialClaimGroups } from "@/lib/special-claims";
import type { SpecialClaimSource } from "@/lib/special-claims";

const claims: SpecialClaimSource[] = [
  {
    id: "normal-claim",
    created_at: "2026-05-01T10:00:00.000Z",
    participant: { id: "p1", name: "지수" },
    hunt_item: {
      id: "normal",
      title: "일반 QR",
      description: "",
      type: "normal",
      tickets: 1,
    },
  },
  {
    id: "joke-claim",
    created_at: "2026-05-01T10:03:00.000Z",
    participant: { id: "p2", name: "민준" },
    hunt_item: {
      id: "joke",
      title: "뒷정리 MVP 후보",
      description: "오늘의 뒷정리 후보에 등록되었습니다.",
      type: "mission",
      tickets: 0,
    },
  },
  {
    id: "bonus-claim",
    created_at: "2026-05-01T10:01:00.000Z",
    participant: { id: "p3", name: "서연" },
    hunt_item: {
      id: "bonus",
      title: "축하의 박수",
      description: "모두의 박수를 받습니다.",
      type: "bonus",
      tickets: 1,
    },
  },
  {
    id: "blank-claim",
    created_at: "2026-05-01T10:02:00.000Z",
    participant: { id: "p4", name: "도윤" },
    hunt_item: {
      id: "blank",
      title: "아쉽지만 꽝",
      description: "아무 일도 일어나지 않았습니다.",
      type: "blank",
      tickets: 0,
    },
  },
];

describe("buildSpecialClaimGroups", () => {
  it("groups non-normal QR claims in reveal order", () => {
    const groups = buildSpecialClaimGroups(claims);

    expect(groups).toEqual([
      {
        type: "bonus",
        claims: [
          {
            id: "bonus-claim",
            participantName: "서연",
            itemTitle: "축하의 박수",
            itemDescription: "모두의 박수를 받습니다.",
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
      {
        type: "mission",
        claims: [
          {
            id: "joke-claim",
            participantName: "민준",
            itemTitle: "뒷정리 MVP 후보",
            itemDescription: "오늘의 뒷정리 후보에 등록되었습니다.",
            tickets: 0,
            claimedAt: "2026-05-01T10:03:00.000Z",
          },
        ],
      },
    ]);
  });
});
