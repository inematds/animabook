import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./books/**/*.png', './books/**/*.jpg', './books/**/*.jpeg', './books/**/*.webp'],
    },
  },
};

export default nextConfig;
