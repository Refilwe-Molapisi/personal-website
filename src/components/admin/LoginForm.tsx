"use client";

import { useActionState } from "react";
import { Lock, Mail } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, { error: undefined } as { error?: string });

  return (
    <div className="bento bento-lg bg-[#15161A] p-7 text-white sm:p-9">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#D6F824]">
          <span className="text-sm font-black text-[#141C00]">RM</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight">Admin sign in</h1>
          <p className="text-[11px] text-white/50">Manage portfolio content</p>
        </div>
      </div>

      <form action={formAction} className="mt-7 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/50">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" aria-hidden />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="admin@example.com"
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#D6F824]/60"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/50">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" aria-hidden />
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••"
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#D6F824]/60"
            />
          </div>
        </div>

        {state?.error && (
          <p role="alert" className="rounded-2xl bg-[#FDE6D2] px-4 py-3 text-xs font-bold text-[#5c3a1e]">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-full bg-[#D6F824] text-sm font-bold text-[#141C00] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-[11px] leading-relaxed text-white/40">
        This area is protected. Sign-in attempts are rate limited. Credentials are configured through environment variables (ADMIN_EMAIL / ADMIN_PASSWORD).
      </p>
    </div>
  );
}
