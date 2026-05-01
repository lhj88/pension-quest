import type { SpecialClaimGroup, SpecialClaimView } from "@/lib/special-claims";
import type { DrawResultView } from "@/types/domain";

export type PrizeRevealSlide = {
  kind: "prize";
  id: string;
  participantName: string;
  prizeName: string;
  prizeDescription: string;
  position: number;
};

export type SpecialRevealType = "bonus" | "blank";

export type SpecialRevealSlide = {
  kind: "special-group";
  id: string;
  type: SpecialRevealType;
  eyebrow: string;
  title: string;
  description: string;
  claims: SpecialClaimView[];
};

export type DrawRevealSlide = PrizeRevealSlide | SpecialRevealSlide;

const specialRevealOrder: SpecialRevealType[] = ["blank", "bonus"];
const specialRevealCopy = {
  bonus: {
    eyebrow: "보너스 QR",
    title: "보너스 QR 발견",
    description: "보너스 QR을 찾은 사람입니다.",
  },
  blank: {
    eyebrow: "꽝 QR",
    title: "꽝 QR 발견",
    description: "꽝 QR을 찾은 사람입니다.",
  },
} satisfies Record<
  SpecialRevealType,
  { eyebrow: string; title: string; description: string }
>;

export function buildDrawRevealSlides(
  results: DrawResultView[],
  specialClaimGroups: SpecialClaimGroup[],
): DrawRevealSlide[] {
  const prizeSlides: PrizeRevealSlide[] = results.map((result) => ({
    kind: "prize",
    id: result.id,
    participantName: result.participant.name,
    prizeName: result.prize.name,
    prizeDescription: result.prize.description,
    position: result.position,
  }));
  const groupByType = new Map(
    specialClaimGroups.map((group) => [group.type, group]),
  );
  const specialSlides: SpecialRevealSlide[] = specialRevealOrder.flatMap(
    (type) => {
      const group = groupByType.get(type);

      if (!group || group.claims.length === 0) {
        return [];
      }

      return [
        {
          kind: "special-group",
          id: `special-${type}`,
          type,
          ...specialRevealCopy[type],
          claims: group.claims,
        },
      ];
    },
  );

  return [...prizeSlides, ...specialSlides];
}
