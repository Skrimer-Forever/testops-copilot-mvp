/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/generation/:path*',
        destination: 'http://176.123.161.105:8000/generation/:path*',
      },
    ];
  },
};

export default nextConfig;
