/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove `swcMinify` — newer Next versions manage this option automatically
  // Ensure Turbopack root is explicit to avoid workspace inference warnings
  turbopack: {
    root: __dirname,
  },
  // No experimental options needed for this dev setup
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:5001/socket.io/:path*',
      },
    ]
  },
}

module.exports = nextConfig
