import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "rm_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me";
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@refilwemolapisi.co.za",
    password: process.env.ADMIN_PASSWORD || "Portfolio@2027",
  };
}

type SessionPayload = { email: string; exp: number };

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function serialize(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function deserialize(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!payload?.email || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(email: string) {
  const token = serialize({ email, exp: Date.now() + SESSION_TTL_MS });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Returns the admin email when a valid session exists, else null. */
export async function getSessionEmail(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return deserialize(token)?.email ?? null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getSessionEmail()) !== null;
}

export async function requireAdmin(): Promise<string> {
  const email = await getSessionEmail();
  if (!email) {
    redirect("/admin/login");
  }
  return email;
}

// ── Simple in-memory login rate limiting (per IP) ───────────────────────────
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}
