import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/cookies";
import { getRequiredEnv } from "@/lib/env";

const SESSION_HOURS = 12;

function base64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", getRequiredEnv("ADMIN_PASSWORD"))
    .update(payload)
    .digest("base64url");
}

export function createAdminSessionValue(now = Date.now()): string {
  const expiresAt = now + SESSION_HOURS * 60 * 60 * 1000;
  const payload = base64Url(JSON.stringify({ expiresAt }));
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { expiresAt?: number };
    return typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSessionValue(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSessionValid())) {
    redirect("/admin");
  }
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createAdminSessionValue(), adminCookieOptions);
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
