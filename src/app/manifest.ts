import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Refilwe Molapisi — Analytics Portfolio",
    short_name: "R. Molapisi",
    description:
      "Portfolio of Refilwe Molapisi, final-year BCom Economics student: projects, research and skills in business intelligence, commercial analysis and economic research.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F3F0",
    theme_color: "#15161A",
    lang: "en",
    categories: ["education", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/og.png",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
  };
}
