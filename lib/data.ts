import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { summarizeClaims } from "@/lib/stats";
import type {
  AppConfig,
  ClaimWithItem,
  DrawResultView,
  HuntItem,
  LeaderboardEntry,
  Participant,
  Prize,
} from "@/types/domain";

export async function getAppConfig(): Promise<AppConfig> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("app_config")
    .insert({ id: 1, game_status: "open", allow_duplicate_winners: false })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return inserted;
}

export async function getAllHuntItems(): Promise<HuntItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("hunt_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getActiveHuntItems(): Promise<HuntItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("hunt_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getParticipantClaims(
  participantId: string,
): Promise<ClaimWithItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("claims")
    .select(
      "id, participant_id, hunt_item_id, created_at, hunt_item:hunt_items(*)",
    )
    .eq("participant_id", participantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as ClaimWithItem[];
}

export async function getParticipants(): Promise<Participant[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const participants = await getParticipants();
  const entries = await Promise.all(
    participants.map(async (participant) => {
      const claims = await getParticipantClaims(participant.id);
      const summary = summarizeClaims(
        claims.map((claim) => ({
          points: claim.hunt_item.points,
          tickets: claim.hunt_item.tickets,
          type: claim.hunt_item.type,
        })),
      );

      return {
        participant,
        score: summary.score,
        tickets: summary.tickets,
        claimCount: summary.claimCount,
      };
    }),
  );

  return entries.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (b.tickets !== a.tickets) {
      return b.tickets - a.tickets;
    }

    return a.participant.created_at.localeCompare(b.participant.created_at);
  });
}

export async function getPrizes(): Promise<Prize[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("prizes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getActivePrizes(): Promise<Prize[]> {
  const prizes = await getPrizes();
  return prizes.filter((prize) => prize.is_active);
}

export async function getDrawResults(): Promise<DrawResultView[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("draw_results")
    .select(
      "id, prize_id, participant_id, position, created_at, prize:prizes(*), participant:participants(*)",
    )
    .order("created_at", { ascending: true })
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as DrawResultView[];
}
