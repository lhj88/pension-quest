import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const PARTICIPANT_COOKIE = "pq_participant_token";
export const ADMIN_COOKIE = "pq_admin_session";

const isProduction = process.env.NODE_ENV === "production";

export const participantCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
  path: "/",
  maxAge: 60 * 60 * 24 * 14,
};

export const adminCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
  path: "/",
  maxAge: 60 * 60 * 12,
};
