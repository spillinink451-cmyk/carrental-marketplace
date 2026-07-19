import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.102",
    "192.168.0.103",
    "192.168.0.105",
    "192.168.0.106",
    "192.168.0.104",
    "192.168.0.101",
  ],
serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "puppeteer"], 
 outputFileTracingIncludes: {
    "/leases/[id]": ["./public/fonts/**"],
    "/partner/leases/[id]": ["./public/fonts/**"],
  },
 images: {
    remotePatterns: [
      { protocol: "https", hostname: "pub-266c7eeb588c418dbbf4968670b17226.r2.dev" },
      { protocol: "https", hostname: "pub-b97e2aed8dca4870b4e5e995783bedc4.r2.dev" },
    ],
  },
};

export default nextConfig;