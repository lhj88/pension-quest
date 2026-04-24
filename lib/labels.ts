import type { GameStatus, HuntItemType } from "@/types/domain";

export function itemTypeLabel(type: HuntItemType): string {
  const labels: Record<HuntItemType, string> = {
    normal: "일반",
    bonus: "보너스",
    blank: "꽝",
    mission: "미션",
  };

  return labels[type];
}

export function gameStatusLabel(status: GameStatus): string {
  const labels: Record<GameStatus, string> = {
    open: "진행중",
    locked: "잠금",
    draw: "추첨 완료",
  };

  return labels[status];
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
