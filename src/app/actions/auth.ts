"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkRateLimit,
  clearRateLimit,
  createSession,
  destroySession,
  getAdminCredentials,
} from "@/lib/auth";
import { db } from "@/lib/db";

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Please enter both email and password." };

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return { error: `Too many attempts. Try again in about ${Math.ceil(rl.retryAfterSec / 60)} minute(s).` };
  }

  const creds = getAdminCredentials();
  const validEmail = email === creds.email.toLowerCase();
  const validPassword = password === creds.password;

  if (!validEmail || !validPassword) {
    return { error: "Incorrect email or password." };
  }

  clearRateLimit(ip);
  await createSession(email);
  await db.auditLog
    .create({ data: { actorEmail: email, action: "login", contentType: "session", metadata: "{}" } })
    .catch(() => {});
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
