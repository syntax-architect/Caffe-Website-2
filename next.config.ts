import type { NextConfig } from "next";

const isExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  output: isExport ? "export" : "standalone",
  ...(isExport ? { images: { unoptimized: true } } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "*.space-z.ai"],
};

export default nextConfig;
