import crypto from "crypto";
import { cookies } from "next/headers";

export type AdminSession = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

export const ADMIN_COOKIE_NAME = "mm_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function base64UrlEncode(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): Buffer {
  const pad = 4 - (input.length % 4 || 4);
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  return Buffer.from(normalized, "base64");
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET");
  }
  if (secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 16 characters");
  }
  return secret;
}

function sign(data: string, secret: string): string {
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  return base64UrlEncode(sig);
}

export function createAdminSessionToken(payload: Omit<AdminSession, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const session: AdminSession = {
    ...payload,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const body = base64UrlEncode(JSON.stringify(session));
  const secret = getSessionSecret();
  const sig = sign(`v1.${body}`, secret);
  return `v1.${body}.${sig}`;
}

export function verifyAdminSessionToken(token: string): AdminSession | null {
  const raw = String(token || "");
  const [v, body, sig] = raw.split(".");
  if (v !== "v1" || !body || !sig) return null;

  let parsed: AdminSession;
  try {
    parsed = JSON.parse(base64UrlDecode(body).toString("utf8")) as AdminSession;
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (!parsed?.sub || !parsed?.email || !parsed?.role) return null;
  if (!parsed?.exp || now > parsed.exp) return null;

  const secret = getSessionSecret();
  const expected = sign(`v1.${body}`, secret);

  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  return parsed;
}

export function getAdminSession(): AdminSession | null {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value || "";
  return verifyAdminSessionToken(token);
}

export function safeGetAdminSession(): AdminSession | null {
  try {
    return getAdminSession();
  } catch {
    return null;
  }
}
