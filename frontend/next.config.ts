import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Disable static optimization for dashboard pages to prevent SSR issues
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
