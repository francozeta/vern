import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jaoprbjzvcsizlrarknt.supabase.co",
      },
      {
        protocol: "https",
        hostname: "cdn-images.dzcdn.net",
      }
    ],
  },
};

export default nextConfig;
