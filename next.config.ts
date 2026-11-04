import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output keeps the app deployable both on Vercel (which uses its
  // own adapter) and on a VPS (node .next/standalone/server.js).
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Don't advertise the framework version.
  poweredByHeader: false,
  // Google Fonts (Outfit) are fetched at build time; on a machine without
  // internet access fall back to the system font stack instead of failing.
};

export default nextConfig;
