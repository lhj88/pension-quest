export type HuntItemType = "normal" | "bonus" | "blank" | "mission";

export type GameStatus = "open" | "locked" | "draw";

export type Participant = {
  id: string;
  name: string;
  client_token: string;
  created_at: string;
};

export type HuntItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  type: HuntItemType;
  points: number;
  tickets: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Claim = {
  id: string;
  participant_id: string;
  hunt_item_id: string;
  created_at: string;
};

export type Prize = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type DrawResult = {
  id: string;
  prize_id: string;
  participant_id: string;
  position: number;
  created_at: string;
};

export type AppConfig = {
  id: number;
  game_status: GameStatus;
  allow_duplicate_winners: boolean;
  updated_at: string;
};

export type ClaimWithItem = Claim & {
  hunt_item: HuntItem;
};

export type LeaderboardEntry = {
  participant: Participant;
  score: number;
  tickets: number;
  claimCount: number;
};

export type DrawResultView = DrawResult & {
  participant: Participant;
  prize: Prize;
};
