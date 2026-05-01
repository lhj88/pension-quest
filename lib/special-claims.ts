import type { HuntItemType } from "@/types/domain";

export type SpecialClaimSource = {
  id: string;
  created_at: string;
  participant: {
    id: string;
    name: string;
  };
  hunt_item: {
    id: string;
    title: string;
    description: string;
    type: HuntItemType;
    tickets: number;
  };
};

export type SpecialClaimView = {
  id: string;
  participantName: string;
  itemTitle: string;
  itemDescription: string;
  tickets: number;
  claimedAt: string;
};

export type SpecialClaimGroup = {
  type: Exclude<HuntItemType, "normal">;
  claims: SpecialClaimView[];
};

const specialTypeOrder: Array<SpecialClaimGroup["type"]> = [
  "bonus",
  "blank",
  "mission",
];

export function buildSpecialClaimGroups(
  claims: SpecialClaimSource[],
): SpecialClaimGroup[] {
  return specialTypeOrder
    .map((type) => ({
      type,
      claims: claims
        .filter((claim) => claim.hunt_item.type === type)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((claim) => ({
          id: claim.id,
          participantName: claim.participant.name,
          itemTitle: claim.hunt_item.title,
          itemDescription: claim.hunt_item.description,
          tickets: claim.hunt_item.tickets,
          claimedAt: claim.created_at,
        })),
    }))
    .filter((group) => group.claims.length > 0);
}
