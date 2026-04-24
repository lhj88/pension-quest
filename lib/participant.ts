import { cookies } from "next/headers";

import { PARTICIPANT_COOKIE } from "@/lib/cookies";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Participant } from "@/types/domain";

export function createParticipantToken(): string {
  return crypto.randomUUID();
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
