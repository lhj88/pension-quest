import { normalizeParticipantName } from "@/lib/participant";
import { sortPrizesForDraw } from "@/lib/prize-order";
import {
  buildSpecialClaimGroups,
  type SpecialClaimGroup,
  type SpecialClaimSource,
} from "@/lib/special-claims";
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

export async function getSpecialClaimGroups(): Promise<SpecialClaimGroup[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("claims")
    .select(
      "id, created_at, participant:participants(id, name), hunt_item:hunt_items(id, title, description, type, tickets)",
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return buildSpecialClaimGroups((data ?? []) as unknown as SpecialClaimSource[]);
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
  const participantGroups = new Map<
    string,
    { displayParticipant: Participant; participants: Participant[] }
  >();

  for (const participant of participants) {
    const normalizedName = normalizeParticipantName(participant.name);
    const existingGroup = participantGroups.get(normalizedName);

    if (!existingGroup) {
      participantGroups.set(normalizedName, {
        displayParticipant: participant,
        participants: [participant],
      });
      continue;
    }

    existingGroup.participants.push(participant);

    if (
      participant.created_at < existingGroup.displayParticipant.created_at
    ) {
      existingGroup.displayParticipant = participant;
    }
  }

  const entries = await Promise.all(
    Array.from(participantGroups.values()).map(async (group) => {
      const claimsByParticipant = await Promise.all(
        group.participants.map((participant) =>
          getParticipantClaims(participant.id),
        ),
      );
      const claimsByItemId = new Map<string, ClaimWithItem>();

      for (const claim of claimsByParticipant.flat()) {
        if (!claimsByItemId.has(claim.hunt_item.id)) {
          claimsByItemId.set(claim.hunt_item.id, claim);
        }
      }

      const claims = Array.from(claimsByItemId.values());
      const summary = summarizeClaims(
        claims.map((claim) => ({
          points: claim.hunt_item.points,
          tickets: claim.hunt_item.tickets,
          type: claim.hunt_item.type,
        })),
      );

      return {
        participant: group.displayParticipant,
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
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortPrizesForDraw(data ?? []);
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

  return ((data ?? []) as unknown as DrawResultView[]).sort((left, right) => {
    if (left.prize.sort_order !== right.prize.sort_order) {
      return left.prize.sort_order - right.prize.sort_order;
    }

    if (left.position !== right.position) {
      return left.position - right.position;
    }

    return left.created_at.localeCompare(right.created_at);
  });
}
