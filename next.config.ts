import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.GITHUB_PAGES === 'true' ? '/family-helper' : '',
  basePath: process.env.GITHUB_PAGES === 'true' ? '/family-helper' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
