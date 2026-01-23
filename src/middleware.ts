import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- CONFIGURATION ---

// 1. Define the Matcher
// This is the #1 fix for your "50 logs a minute" issue.
// We strictly exclude static files, images, and next.js internals.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// 2. Initialize Redis (Outside handler for performance)
// We use a try/catch in the handler in case env vars are missing during build
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const ratelimitPublic = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"), // 20 requests per 10s
});

const ratelimitSensitive = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests per 10s
});

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const hostname = req.headers.get("host");

  // --- PHASE 1: SECURITY SHIELD 🛡️ ---
  
  // A. Rate Limiting (Production Only)
  // We wrap this in try/catch to "Fail Open". 
  // If Redis is down, we allow the traffic rather than crashing the site.
  if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const ip = req.headers.get("x-forwarded-for")?.split(',')[0] ?? "127.0.0.1";
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
    } catch (error) {
      console.error("Rate limit error:", error);
      // Proceed without limiting if Redis fails
    }
  }

  // B. Host Header Validation
  if (!hostname) return new NextResponse("Bad Request", { status: 400 });

  // --- PHASE 2: SUBDOMAIN & ROUTING PREP 🌐 ---

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  let subdomain = "app"; // Default to Landing/Admin

  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  
  if (!isLocalhost) {
      const currentHost = hostname.replace(`.${rootDomain}`, "");
      if (currentHost !== hostname) {
          subdomain = currentHost;
      }
  }

  // 🔧 DEV OVERRIDE (Allows testing subdomains on localhost via ?site=nike)
  if (url.searchParams.has("site")) {
      subdomain = url.searchParams.get("site")!;
  }

  // --- PHASE 3: CREATE THE RESPONSE OBJECT 🚦 ---
  
  let response: NextResponse;

  // Prepare Headers for Server Components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", path);
  requestHeaders.set("x-url", req.url);
  requestHeaders.set("x-forwarded-host", hostname); 
  requestHeaders.set("x-origin", req.headers.get("origin") || "");

  // Logic: Admin Redirect Safety
  if (subdomain !== "app" && subdomain !== "www" && path.startsWith("/admin")) {
      const mainAppUrl = new URL(path, req.url);
      mainAppUrl.hostname = isLocalhost ? "localhost" : rootDomain;
      mainAppUrl.port = url.port;
      return NextResponse.redirect(mainAppUrl);
  }

  // Logic: Determine Rewrite vs Pass-through
  if (subdomain === "app" || subdomain === "www") {
      // Main App / Landing Page / Admin Dashboard
      response = NextResponse.next({
          request: { headers: requestHeaders },
      });
  } else {
      // Storefront Rewrite (e.g. nike.nimdeshop.com -> /sites/nike)
      const newUrl = new URL(`/sites/${subdomain}${path}`, req.url);
      newUrl.search = url.search;
      
      response = NextResponse.rewrite(newUrl, {
          request: { headers: requestHeaders },
      });
  }

  // --- PHASE 4: SUPABASE AUTH 🔐 ---
  // We refresh the session here to keep the user logged in.
  // We MUST use the 'response' object created above so cookies persist.

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

  await supabase.auth.getUser();

  // --- PHASE 5: SECURITY HEADERS 💉 ---
  
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  if (process.env.NODE_ENV === 'production') {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}