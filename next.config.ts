import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        // This wildcard allows ALL Supabase projects
        hostname: '**.supabase.co', 
      },
    ],
  },
};

export default nextConfig;