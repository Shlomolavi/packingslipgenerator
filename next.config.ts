import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/__internal/metrics',
        destination: '/internal/metrics',
      },
    ];
  },
};

export default nextConfig;
