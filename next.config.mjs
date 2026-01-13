/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. OPTIMIZATION: remove "X-Powered-By: Next.js" header (Security through obscurity)
  poweredByHeader: false,
  
  // 2. IMAGE OPTIMIZATION: Allow images only from trusted domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Your Supabase Storage
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // For dummy data
      },
      {
        protocol: 'https',
        hostname: 'grainy-gradients.vercel.app', // For your background textures
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com', // For Apple Product images
      }
    ],
    // Cache optimized images for a long time
    minimumCacheTTL: 60, 
  },

  // 3. SECURITY HEADERS
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
            value: 'SAMEORIGIN' // Prevents your site from being put in an iframe (Clickjacking protection)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Prevents browser from guessing content types
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' // Blocks access to sensitive APIs
          }
        ]
      }
    ];
  }
};

export default nextConfig;