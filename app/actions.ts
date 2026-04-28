"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PARTICIPANT_COOKIE, participantCookieOptions } from "@/lib/cookies";
import {
  findOrCreateParticipantByName,
  normalizeParticipantName,
} from "@/lib/participant";

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
  const name = normalizeParticipantName(String(formData.get("name") ?? ""));
  const returnTo = normalizeReturnTo(formData.get("returnTo"));

  if (name.length < 1 || name.length > 30) {
    redirect(`/?error=name&returnTo=${encodeURIComponent(returnTo)}`);
  }

  const participant = await findOrCreateParticipantByName(name);
  const cookieStore = await cookies();
  cookieStore.set(
    PARTICIPANT_COOKIE,
    participant.client_token,
    participantCookieOptions,
  );
  redirect(returnTo);
}
