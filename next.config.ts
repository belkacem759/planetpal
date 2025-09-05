import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://lh3.googleusercontent.com')],
    domains: ['lh3.googleusercontent.com'],
  }
};

export default nextConfig;
