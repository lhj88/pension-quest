"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  requireAdmin,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { getActivePrizes, getLeaderboard } from "@/lib/data";
import { selectWeightedWinners } from "@/lib/draw";
import { createHuntItemSortOrderUpdates } from "@/lib/hunt-item-order";
import { createPrizeSortOrderUpdates } from "@/lib/prize-order";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { GameStatus, HuntItemType } from "@/types/domain";

function textField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function numberField(formData: FormData, name: string, fallback = 0): number {
  const parsed = Number.parseInt(String(formData.get(name) ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function checkboxField(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

function jsonStringArrayField(formData: FormData, name: string): string[] {
  try {
    const parsed = JSON.parse(textField(formData, name));
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function parseItemType(value: string): HuntItemType {
  if (
    value === "normal" ||
    value === "bonus" ||
    value === "blank" ||
    value === "mission"
  ) {
    return value;
  }

  return "normal";
}

function parseGameStatus(value: string): GameStatus {
  if (value === "open" || value === "locked" || value === "draw") {
    return value;
  }

  return "open";
}

function revalidateAdminAndPublicPages() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/prizes");
  revalidatePath("/admin/draw");
  revalidatePath("/admin/settings");
  revalidatePath("/me");
  revalidatePath("/results");
}

function revalidateHuntItemPages() {
  revalidatePath("/admin/items");
  revalidatePath("/admin/qr");
  revalidateAdminAndPublicPages();
}

export async function loginAdmin(formData: FormData) {
  const password = textField(formData, "password");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=1");
  }

  await setAdminSessionCookie();
  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  await clearAdminSessionCookie();
  redirect("/admin");
}

export async function saveHuntItem(formData: FormData) {
  await requireAdmin();

  const id = textField(formData, "id");
  const payload = {
    code: textField(formData, "code"),
    title: textField(formData, "title"),
    description: textField(formData, "description"),
    type: parseItemType(textField(formData, "type")),
    points: Math.max(0, numberField(formData, "points")),
    tickets: Math.max(0, numberField(formData, "tickets")),
    is_active: checkboxField(formData, "is_active"),
    sort_order: numberField(formData, "sort_order"),
  };

  const supabase = createSupabaseAdminClient();
  const query = id
    ? supabase.from("hunt_items").update(payload).eq("id", id)
    : supabase.from("hunt_items").insert(payload);
  const { error } = await query;

  if (error) {
    throw error;
  }

  revalidateHuntItemPages();
  redirect("/admin/items");
}

export async function deleteHuntItem(formData: FormData) {
  await requireAdmin();

  const id = textField(formData, "id");

  if (!id) {
    redirect("/admin/items");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("hunt_items").delete().eq("id", id);

  if (error) {
    throw error;
  }

  revalidateHuntItemPages();
  redirect("/admin/items");
}

export async function reorderHuntItems(formData: FormData) {
  await requireAdmin();

  const updates = createHuntItemSortOrderUpdates(
    jsonStringArrayField(formData, "ordered_ids"),
  );

  if (updates.length === 0) {
    redirect("/admin/items");
  }

  const supabase = createSupabaseAdminClient();
  const results = await Promise.all(
    updates.map((update) =>
      supabase
        .from("hunt_items")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id),
    ),
  );
  const error = results.find((result) => result.error)?.error;

  if (error) {
    throw error;
  }

  revalidateHuntItemPages();
  redirect("/admin/items");
}

export async function savePrize(formData: FormData) {
  await requireAdmin();

  const id = textField(formData, "id");
  const payload = {
    name: textField(formData, "name"),
    description: textField(formData, "description"),
    quantity: Math.max(1, numberField(formData, "quantity", 1)),
    is_active: checkboxField(formData, "is_active"),
    sort_order: Math.max(0, numberField(formData, "sort_order", 0)),
  };

  const supabase = createSupabaseAdminClient();
  const query = id
    ? supabase.from("prizes").update(payload).eq("id", id)
    : supabase.from("prizes").insert(payload);
  const { error } = await query;

  if (error) {
    throw error;
  }

  revalidateAdminAndPublicPages();
  redirect("/admin/prizes");
}

export async function reorderPrizes(formData: FormData) {
  await requireAdmin();

  const updates = createPrizeSortOrderUpdates(
    jsonStringArrayField(formData, "ordered_ids"),
  );

  if (updates.length === 0) {
    redirect("/admin/prizes");
  }

  const supabase = createSupabaseAdminClient();
  const results = await Promise.all(
    updates.map((update) =>
      supabase
        .from("prizes")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id),
    ),
  );
  const error = results.find((result) => result.error)?.error;

  if (error) {
    throw error;
  }

  revalidateAdminAndPublicPages();
  redirect("/admin/prizes");
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("app_config")
    .update({
      game_status: parseGameStatus(textField(formData, "game_status")),
      allow_duplicate_winners: checkboxField(
        formData,
        "allow_duplicate_winners",
      ),
    })
    .eq("id", 1);

  if (error) {
    throw error;
  }

  revalidateAdminAndPublicPages();
  redirect("/admin/settings");
}

export async function resetParticipants(formData: FormData) {
  await requireAdmin();

  const confirmation = textField(formData, "confirmation");

  if (confirmation !== "초기화") {
    redirect("/admin/settings?reset=confirm");
  }

  const supabase = createSupabaseAdminClient();
  const { error: drawResultsError } = await supabase
    .from("draw_results")
    .delete()
    .not("id", "is", null);

  if (drawResultsError) {
    throw drawResultsError;
  }

  const { error: claimsError } = await supabase
    .from("claims")
    .delete()
    .not("id", "is", null);

  if (claimsError) {
    throw claimsError;
  }

  const { error: participantsError } = await supabase
    .from("participants")
    .delete()
    .not("id", "is", null);

  if (participantsError) {
    throw participantsError;
  }

  const { error: configError } = await supabase
    .from("app_config")
    .update({ game_status: "open" })
    .eq("id", 1);

  if (configError) {
    throw configError;
  }

  revalidateAdminAndPublicPages();
  redirect("/admin/settings?reset=done");
}

export async function runDraw(formData: FormData) {
  await requireAdmin();

  const allowDuplicateWinners = checkboxField(
    formData,
    "allow_duplicate_winners",
  );
  const [leaderboard, prizes] = await Promise.all([
    getLeaderboard(),
    getActivePrizes(),
  ]);
  const totalSlots = prizes.reduce((sum, prize) => sum + prize.quantity, 0);
  const winners = selectWeightedWinners({
    participants: leaderboard.map((entry) => ({
      id: entry.participant.id,
      name: entry.participant.name,
      tickets: entry.tickets,
    })),
    totalSlots,
    allowDuplicateWinners,
  });

  const rows: Array<{
    prize_id: string;
    participant_id: string;
    position: number;
  }> = [];
  let winnerIndex = 0;

  for (const prize of prizes) {
    for (let position = 1; position <= prize.quantity; position += 1) {
      const winner = winners[winnerIndex];

      if (!winner) {
        break;
      }

      rows.push({
        prize_id: prize.id,
        participant_id: winner.id,
        position,
      });
      winnerIndex += 1;
    }
  }

  const supabase = createSupabaseAdminClient();
  const { error: deleteError } = await supabase
    .from("draw_results")
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    throw deleteError;
  }

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("draw_results")
      .insert(rows);

    if (insertError) {
      throw insertError;
    }
  }

  const { error: configError } = await supabase
    .from("app_config")
    .update({
      game_status: "draw",
      allow_duplicate_winners: allowDuplicateWinners,
    })
    .eq("id", 1);

  if (configError) {
    throw configError;
  }

  revalidateAdminAndPublicPages();
  redirect("/admin/draw");
}

export async function clearDrawResults() {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("draw_results")
    .delete()
    .not("id", "is", null);

  if (error) {
    throw error;
  }

  revalidatePath("/admin/draw");
  revalidatePath("/results");
  redirect("/admin/draw");
}
