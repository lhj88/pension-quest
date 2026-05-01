export type ClaimMotionClasses = {
  badge: string;
  card: string;
  decoration: string | null;
  description: string;
  participant: string;
  stats: [string, string];
  status: string;
  title: string;
};

export function getClaimMotionClasses(
  isDuplicate: boolean,
): ClaimMotionClasses {
  return {
    badge: "claim-badge-pop",
    card: isDuplicate
      ? "claim-card-motion claim-card-duplicate"
      : "claim-card-motion claim-card-success",
    decoration: isDuplicate ? null : "claim-card-shine",
    description: "claim-description-reveal",
    participant: "claim-participant-reveal",
    stats: [
      "claim-stat-reveal claim-stat-reveal-one",
      "claim-stat-reveal claim-stat-reveal-two",
    ],
    status: "claim-status-reveal",
    title: "claim-title-reveal",
  };
}
