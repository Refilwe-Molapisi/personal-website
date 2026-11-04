import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "Privacy notice for the Refilwe Molapisi analytics portfolio — what data this site does and does not collect.",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="bento bento-lg p-6 sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#D8E9FE]">
          <ShieldCheck className="h-6 w-6 text-[#1e3a5f]" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">Privacy notice</h1>
        <p className="mt-2 text-xs text-gray-500">Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long" })}</p>
      </header>

      <div className="bento synkra-prose p-6 sm:p-8">
        <h2>What this site collects</h2>
        <p>
          This portfolio is designed to collect as little visitor data as possible. The site does not require accounts, does not run comments, and does not use advertising or cross-site tracking cookies. Standard server logs may be kept briefly by the hosting provider for security and reliability purposes.
        </p>
        <h2>What this site does not do</h2>
        <ul>
          <li>No visitor accounts or profiles are created.</li>
          <li>No contact forms are provided; contact happens via the LinkedIn link on the About page.</li>
          <li>No advertising, cross-site tracking or visitor profiling.</li>
        </ul>
        <h2>Your rights (POPIA)</h2>
        <p>
          This site is operated from South Africa and respects the Protection of Personal Information Act (POPIA). Since the site deliberately collects no personal information from visitors, there is nothing to access, correct or delete. If you believe personal information about you appears anywhere on this site and you object to it, please reach out via LinkedIn and it will be reviewed promptly.
        </p>
        <h2>Content notices</h2>
        <p>
          Projects marked as simulated or synthetic use data generated for demonstration purposes and do not describe real individuals or organisations. Datasets and sources are cited where applicable, and content is used under appropriate licences with attribution.
        </p>
      </div>
    </div>
  );
}
