import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: true,
  },
  serverExternalPackages: ['@supabase/ssr'],
  transpilePackages: [],
  output: process.env.VERCEL ? 'standalone' : undefined,
  images: {
    domains: [
      'cyluugzbgqpntjhelnzr.supabase.co', // Your current Supabase project
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
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
