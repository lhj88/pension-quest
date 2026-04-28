import { getAppConfig } from "@/lib/data";
import { findOrCreateParticipantByName } from "@/lib/participant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Claim, HuntItem, Participant } from "@/types/domain";

export type ClaimHuntItemResult =
  | { status: "success"; item: HuntItem; claim: Claim }
  | { status: "duplicate"; item: HuntItem }
  | { status: "invalid" }
  | { status: "inactive"; item: HuntItem }
  | { status: "locked" };

export type ClaimHuntItemByNameResult =
  | { status: "success"; item: HuntItem; claim: Claim; participant: Participant }
  | { status: "duplicate"; item: HuntItem; participant: Participant }
  | { status: "invalid" }
  | { status: "inactive"; item: HuntItem }
  | { status: "locked" };

export async function claimHuntItem(
  participantId: string,
  rawCode: string,
): Promise<ClaimHuntItemResult> {
  const itemResult = await getClaimableHuntItem(rawCode);

  if (itemResult.status !== "ok") {
    return itemResult;
  }

  return insertClaim(participantId, itemResult.item);
}

export async function claimHuntItemByName(
  rawName: string,
  rawCode: string,
): Promise<ClaimHuntItemByNameResult> {
  const itemResult = await getClaimableHuntItem(rawCode);

  if (itemResult.status !== "ok") {
    return itemResult;
  }

  const participant = await findOrCreateParticipantByName(rawName);
  const claimResult = await insertClaim(participant.id, itemResult.item);

  if (claimResult.status === "success") {
    return { ...claimResult, participant };
  }

  if (claimResult.status === "duplicate") {
    return { ...claimResult, participant };
  }

  return claimResult;
}

type ClaimableHuntItemResult =
  | { status: "ok"; item: HuntItem }
  | { status: "invalid" }
  | { status: "inactive"; item: HuntItem }
  | { status: "locked" };

async function getClaimableHuntItem(
  rawCode: string,
): Promise<ClaimableHuntItemResult> {
  const config = await getAppConfig();

  if (config.game_status !== "open") {
    return { status: "locked" };
  }

  const code = rawCode.trim();
  const supabase = createSupabaseAdminClient();
  const { data: item, error: itemError } = await supabase
    .from("hunt_items")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (itemError) {
    throw itemError;
  }

  if (!item) {
    return { status: "invalid" };
  }

  if (!item.is_active) {
    return { status: "inactive", item };
  }

  return { status: "ok", item };
}

async function insertClaim(
  participantId: string,
  item: HuntItem,
): Promise<ClaimHuntItemResult> {
  const supabase = createSupabaseAdminClient();
  const { data: claim, error: claimError } = await supabase
    .from("claims")
    .insert({
      participant_id: participantId,
      hunt_item_id: item.id,
    })
    .select("*")
    .single();

  if (!claimError && claim) {
    return { status: "success", item, claim };
  }

  if (claimError?.code === "23505") {
    return { status: "duplicate", item };
  }

  throw claimError;
}
