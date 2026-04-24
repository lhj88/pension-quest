import { getAppConfig } from "@/lib/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Claim, HuntItem } from "@/types/domain";

export type ClaimHuntItemResult =
  | { status: "success"; item: HuntItem; claim: Claim }
  | { status: "duplicate"; item: HuntItem }
  | { status: "invalid" }
  | { status: "inactive"; item: HuntItem }
  | { status: "locked" };

export async function claimHuntItem(
  participantId: string,
  rawCode: string,
): Promise<ClaimHuntItemResult> {
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
