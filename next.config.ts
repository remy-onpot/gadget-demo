import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ FIX: Allow Server Actions from GitHub Codespaces
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        'reimagined-potato-4jvrq7qwvwwpfjp4w-3000.app.github.dev' 
      ],
    },
  },
  
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