import type { HuntItemType } from "@/types/domain";

export type ClaimValue = {
  points: number;
  tickets: number;
  type: HuntItemType;
};

export type ClaimSummary = {
  score: number;
  tickets: number;
  claimCount: number;
  byType: Record<HuntItemType, number>;
};

export function summarizeClaims(claims: ClaimValue[]): ClaimSummary {
  return claims.reduce<ClaimSummary>(
    (summary, claim) => {
      summary.score += claim.points;
      summary.tickets += claim.tickets;
      summary.claimCount += 1;
      summary.byType[claim.type] += 1;
      return summary;
    },
    {
      score: 0,
      tickets: 0,
      claimCount: 0,
      byType: {
        normal: 0,
        bonus: 0,
        blank: 0,
        mission: 0,
      },
    },
  );
}
