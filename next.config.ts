import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://lh3.googleusercontent.com')],
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    turbo: {
      root: __dirname,
    },
    viewTransition: true,
  },
};

export default nextConfig;
