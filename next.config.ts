import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // 解决ethers.js模块解析问题
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ethersproject/constants/lib.esm/addresses': require.resolve('@ethersproject/constants/lib.esm/addresses.js'),
    };
    return config;
  },
};

export default nextConfig;
