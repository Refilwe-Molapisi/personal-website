import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="grid min-h-screen place-items-center bg-[#F4F3F0] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#15161A] shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to site
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#15161A] px-3.5 py-2 text-[11px] font-bold text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-[#D6F824]" aria-hidden /> Private area
          </span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
