import { getSiteSettings } from "@/lib/settings";
import { ProfileForm, type ProfileData } from "@/components/admin/ProfileForm";
import { Reveal } from "@/components/synkra/Reveal";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const s = await getSiteSettings();
  const initial: ProfileData = {
    displayName: s?.displayName ?? "",
    headline: s?.headline ?? "",
    intro: s?.intro ?? "",
    biography: s?.biography ?? "",
    educationSummary: s?.educationSummary ?? "",
    professionalInterests: s?.professionalInterests ?? "",
    linkedinUrl: s?.linkedinUrl ?? "",
    publicEmail: s?.publicEmail ?? "",
    homeIntro: s?.homeIntro ?? "",
    footerText: s?.footerText ?? "",
    defaultMetaTitle: s?.defaultMetaTitle ?? "",
    defaultMetaDescription: s?.defaultMetaDescription ?? "",
  };

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Profile & site settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          This is the public identity of the site. Keep it accurate — no invented experience, qualifications or claims.
        </p>
      </Reveal>
      <ProfileForm initial={initial} />
    </div>
  );
}
