import { cookies } from "next/headers";

import { PARTICIPANT_COOKIE } from "@/lib/cookies";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Participant } from "@/types/domain";

export function createParticipantToken(): string {
  return crypto.randomUUID();
}

export function normalizeParticipantName(rawName: string): string {
  return rawName.replace(/\s+/g, " ").trim();
}

export async function getParticipantToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PARTICIPANT_COOKIE)?.value ?? null;
}

export async function getCurrentParticipant(): Promise<Participant | null> {
  const token = await getParticipantToken();

  if (!token) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("client_token", token)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function findOrCreateParticipantByName(
  rawName: string,
): Promise<Participant> {
  const name = normalizeParticipantName(rawName);

  if (name.length < 1 || name.length > 30) {
    throw new Error("Invalid participant name");
  }

  const supabase = createSupabaseAdminClient();
  const { data: participants, error: findError } = await supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: true });

  if (findError) {
    throw findError;
  }

  const existingParticipant = (participants ?? []).find(
    (participant) => normalizeParticipantName(participant.name) === name,
  );

  if (existingParticipant) {
    return existingParticipant;
  }

  const { data: insertedParticipant, error: insertError } = await supabase
    .from("participants")
    .insert({
      name,
      client_token: createParticipantToken(),
    })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return insertedParticipant;
}
