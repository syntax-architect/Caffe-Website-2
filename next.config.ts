import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "*.space-z.ai"],
};

export default nextConfig;
