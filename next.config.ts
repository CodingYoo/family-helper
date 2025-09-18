import type { NextConfig } from "next";

// 检测是否为静态部署环境
const isStaticDeploy = process.env.NODE_ENV === 'production' || process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // 在生产环境下始终使用 /family-helper 路径
  assetPrefix: isStaticDeploy ? '/family-helper' : '',
  basePath: isStaticDeploy ? '/family-helper' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
