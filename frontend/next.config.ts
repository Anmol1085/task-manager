import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify is enabled by default in Next.js 13+, but good to be explicit or if on older version. 
  // Since we are on Next 16, we can leave it or add experimental options if needed.
  // For now, these are standard optimizations.
  poweredByHeader: false,
};

export default nextConfig;
