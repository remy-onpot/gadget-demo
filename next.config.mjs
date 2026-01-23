/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. OPTIMIZATION: remove "X-Powered-By: Next.js" header
  poweredByHeader: false,

  // 2. CRITICAL FIX: TRUST YOUR SUBDOMAINS
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        '*.nimdeshop.com',          // Your production domain
        '*.gadget-demo.vercel.app', // Vercel preview deployments
        'gadget-demo.vercel.app'
      ],
    },
  },
  
  // 3. IMAGE OPTIMIZATION
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', 
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', 
      },
      {
        protocol: 'https',
        hostname: 'grainy-gradients.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
      }
    ],
    minimumCacheTTL: 60, 
  },

  // 4. SECURITY HEADERS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ];
  }
};

export default nextConfig;