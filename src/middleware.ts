import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. RATE LIMITER CONFIGURATION
// We use ephemeral caching for speed.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Define limits: 
// - Public: 20 requests per 10 seconds (Browsing)
// - Auth/Sensitive: 5 requests per 10 seconds (Login/Checkout)
const ratelimitPublic = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
});

const ratelimitSensitive = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";  
  // --- PHASE 1: SECURITY SHIELD 🛡️ ---
  
  // A. Rate Limiting
  // Only limit strictly in production to avoid annoying dev experience
  if (process.env.NODE_ENV === 'production') {
    const isSensitive = path.startsWith('/checkout') || path.startsWith('/login') || path.startsWith('/api/auth');
    const limiter = isSensitive ? ratelimitSensitive : ratelimitPublic;
    
    const { success, limit, reset, remaining } = await limiter.limit(`mw_${ip}`);
    
    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }

  // B. Host Header Validation (Prevent Host Header Injection)
  const hostname = req.headers.get("host");
  if (!hostname) return new NextResponse("Bad Request", { status: 400 });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const allowedDomains = [rootDomain, "www." + rootDomain];
  
  // --- PHASE 2: SUBDOMAIN PARSING 🌐 ---
  
  let subdomain = "app"; // Default to Landing/Admin

  // Handle Localhost vs Production
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  
  if (!isLocalhost) {
      // Determine subdomain
      const currentHost = hostname.replace(`.${rootDomain}`, "");
      if (currentHost !== hostname) {
          subdomain = currentHost;
      }
  }

  // 🔧 DEV OVERRIDE
  if (url.searchParams.has("site")) {
      subdomain = url.searchParams.get("site")!;
  }

  // --- PHASE 3: SUPABASE AUTH REFRESH 🔐 ---
  
  let response = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  // --- PHASE 4: SECURITY HEADERS INJECTION 💉 ---
  
  // Prevent Clickjacking (iframe protection)
  // We allow SAMEORIGIN so you can iframe your own content if needed
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Control information sent to other sites
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Enforce HTTPS (HSTS) - Production Only
  if (process.env.NODE_ENV === 'production') {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // --- PHASE 5: ROUTING LOGIC 🚦 ---

  // A. Admin/App Redirects
  // If a user tries to access /admin on a subdomain (e.g., nike.nimdeshop.com/admin),
  // redirect them to the main app URL to avoid auth confusion.
  if (subdomain !== "app" && subdomain !== "www" && path.startsWith("/admin")) {
      const mainAppUrl = new URL(path, req.url);
      mainAppUrl.hostname = isLocalhost ? hostname : rootDomain;
      mainAppUrl.port = url.port;
      return NextResponse.redirect(mainAppUrl);
  }

  // B. Main App / Admin Dashboard
  if (subdomain === "app" || subdomain === "www") {
      // Optional: Add specific logic for the main landing page or admin app here
      return response;
  }

  // C. Storefront Rewrite
  // Rewrite traffic to src/app/_sites/[site]
  // We use `_sites` (underscore) so it's not routeable by default in Next.js file system
  const newUrl = new URL(`/sites/${subdomain}${path}`, req.url);
  
  // Preserve query params
  newUrl.search = url.search;
  
  return NextResponse.rewrite(newUrl);
}