import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: true,
  },
  serverExternalPackages: ['@supabase/ssr'],
  transpilePackages: [],
  output: process.env.VERCEL ? 'standalone' : undefined,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // React 19 compatibility
  reactStrictMode: false,
};

export default nextConfig;
