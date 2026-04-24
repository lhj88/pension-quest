"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PARTICIPANT_COOKIE, participantCookieOptions } from "@/lib/cookies";
import {
  createParticipantToken,
  getParticipantToken,
} from "@/lib/participant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function normalizeReturnTo(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/me";
  }

  if (value.startsWith("//") || value.startsWith("/admin")) {
    return "/me";
  }

  return value;
}

export async function registerParticipant(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const returnTo = normalizeReturnTo(formData.get("returnTo"));

  if (name.length < 1 || name.length > 30) {
    redirect(`/?error=name&returnTo=${encodeURIComponent(returnTo)}`);
  }

  let token = await getParticipantToken();
  const supabase = createSupabaseAdminClient();

  if (token) {
    const { data, error } = await supabase
      .from("participants")
      .update({ name })
      .eq("client_token", token)
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      token = null;
    }
  }

  if (!token) {
    token = createParticipantToken();
    const { error } = await supabase.from("participants").insert({
      name,
      client_token: token,
    });

    if (error) {
      throw error;
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(PARTICIPANT_COOKIE, token, participantCookieOptions);
  redirect(returnTo);
}
