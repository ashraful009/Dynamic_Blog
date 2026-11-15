import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com https://fonts.maateen.me; font-src 'self' fonts.gstatic.com https://fonts.maateen.me; img-src 'self' data: https: http: https://i.ytimg.com; media-src 'self' https: http:; connect-src 'self' http: https: ws: wss: https://res.cloudinary.com https://cloudflareinsights.com; frame-src 'self' https://vercel.live https://res.cloudinary.com https://www.youtube-nocookie.com https://www.youtube.com; child-src 'self' https://vercel.live https://res.cloudinary.com https://www.youtube-nocookie.com https://www.youtube.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
