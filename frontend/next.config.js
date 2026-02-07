/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove `swcMinify` — newer Next versions manage this option automatically
  // Ensure Turbopack root is explicit to avoid workspace inference warnings
  // No experimental options needed for this dev setup
  // No experimental options needed for this dev setup

}

module.exports = nextConfig
