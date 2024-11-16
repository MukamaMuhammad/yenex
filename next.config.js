/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.API_URL + "/:path*", // http://your-digitalocean-ip
        // You can also use path-specific rewrites
        // source: '/api/users/:id',
        // destination: 'http://your-digitalocean-ip/users/:id',
      },
    ];
  },
};

module.exports = nextConfig;
