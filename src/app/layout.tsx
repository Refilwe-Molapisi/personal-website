import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { getSiteSettings } from "@/lib/settings";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings?.displayName || "Refilwe Molapisi";
  const title = settings?.defaultMetaTitle || `${name} — Analytics Portfolio`;
  const description =
    settings?.defaultMetaDescription ||
    `Portfolio of ${name}, final-year BCom Economics student: projects, research and skills in business intelligence, commercial analysis and economic research.`;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(base),
    title: {
      default: title,
      template: `%s · ${name}`,
    },
    description,
    applicationName: `${name} — Analytics Portfolio`,
    keywords: [
      "Refilwe Molapisi",
      "analytics portfolio",
      "business intelligence",
      "commercial analysis",
      "economic research",
      "BCom Economics",
      "data analysis South Africa",
      "Power BI",
      "market research",
    ],
    authors: [{ name, url: base }],
    creator: name,
    publisher: name,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: "/",
      siteName: name,
      type: "website",
      locale: "en_ZA",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: `${name} — Analytics Portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "education",
  };
}

export const viewport: Viewport = {
  themeColor: "#15161A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${outfit.variable} antialiased`} style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
