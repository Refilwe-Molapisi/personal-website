import { AppShell } from "@/components/synkra/AppShell";
import { getSiteSettings } from "@/lib/settings";
import { buildPersonSchema, buildWebSiteSchema, JsonLdScript } from "@/lib/seo";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const name = settings?.displayName || "Refilwe Molapisi";

  // Site-wide structured data: the Person entity plus the WebSite entity.
  // Rendered once per public page so search and AI engines always see them.
  const graph = [buildWebSiteSchema(settings), buildPersonSchema(settings)];

  return (
    <AppShell
      displayName={name}
      headline={settings?.headline || "Final-year BCom Economics student"}
      linkedinUrl={settings?.linkedinUrl || ""}
    >
      <JsonLdScript data={{ "@context": "https://schema.org", "@graph": graph }} />
      {children}
    </AppShell>
  );
}
