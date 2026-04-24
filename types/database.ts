import type {
  AppConfig,
  Claim,
  DrawResult,
  HuntItem,
  Participant,
  Prize,
} from "@/types/domain";

type Insert<T, GeneratedKeys extends keyof T> = Omit<T, GeneratedKeys> &
  Partial<Pick<T, GeneratedKeys>>;

export type Database = {
  public: {
    Tables: {
      participants: {
        Row: Participant;
        Insert: Insert<Participant, "id" | "created_at">;
        Update: Partial<Omit<Participant, "id" | "created_at">>;
        Relationships: [];
      };
      hunt_items: {
        Row: HuntItem;
        Insert: Insert<HuntItem, "id" | "created_at">;
        Update: Partial<Omit<HuntItem, "id" | "created_at">>;
        Relationships: [];
      };
      claims: {
        Row: Claim;
        Insert: Insert<Claim, "id" | "created_at">;
        Update: Partial<Omit<Claim, "id" | "created_at">>;
        Relationships: [];
      };
      prizes: {
        Row: Prize;
        Insert: Insert<Prize, "id" | "created_at">;
        Update: Partial<Omit<Prize, "id" | "created_at">>;
        Relationships: [];
      };
      draw_results: {
        Row: DrawResult;
        Insert: Insert<DrawResult, "id" | "created_at">;
        Update: Partial<Omit<DrawResult, "id" | "created_at">>;
        Relationships: [];
      };
      app_config: {
        Row: AppConfig;
        Insert: Insert<AppConfig, "updated_at">;
        Update: Partial<Omit<AppConfig, "id" | "updated_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
