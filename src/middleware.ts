import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- CONFIGURATION ---

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

// 2. Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// ⚡ UPDATED LIMITS: Relaxed to prevent self-DDoS during admin navigation
const ratelimitPublic = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "10 s"), // Increased to 50
});

const ratelimitSensitive = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // Increased to 10
});

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const hostname = req.headers.get("host");

  // --- PHASE 1: SECURITY SHIELD 🛡️ ---
  
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
    }
  }

  if (!hostname) return new NextResponse("Bad Request", { status: 400 });

  // --- PHASE 2: SUBDOMAIN & ROUTING PREP 🌐 ---

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  let subdomain = "app"; 

  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  
  if (!isLocalhost) {
      const currentHost = hostname.replace(`.${rootDomain}`, "");
      if (currentHost !== hostname) {
          subdomain = currentHost;
      }
  }

  if (url.searchParams.has("site")) {
      subdomain = url.searchParams.get("site")!;
  }

  // --- PHASE 3: CREATE THE RESPONSE OBJECT 🚦 ---
  
  let response: NextResponse;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", path);
  requestHeaders.set("x-url", req.url);
  requestHeaders.set("x-forwarded-host", hostname); 
  requestHeaders.set("x-origin", req.headers.get("origin") || "");

  // Logic: Admin Redirect Safety (Subdomain -> Main Domain)
  if (subdomain !== "app" && subdomain !== "www" && path.startsWith("/admin")) {
      const mainAppUrl = new URL(path, req.url);
      mainAppUrl.hostname = isLocalhost ? "localhost" : rootDomain;
      mainAppUrl.port = url.port;
      return NextResponse.redirect(mainAppUrl);
  }

  // Logic: Determine Rewrite vs Pass-through
  if (subdomain === "app" || subdomain === "www") {
      response = NextResponse.next({
          request: { headers: requestHeaders },
      });
  } else {
      const newUrl = new URL(`/sites/${subdomain}${path}`, req.url);
      newUrl.search = url.search;
      
      response = NextResponse.rewrite(newUrl, {
          request: { headers: requestHeaders },
      });
  }

  // --- PHASE 4: SUPABASE AUTH & PROTECTION 🔐 ---

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

  // 1. Get the user
  const { data: { user } } = await supabase.auth.getUser();

  // 2. ADMIN PROTECTION (The Fix for Demo Shop Ghost)
  // If trying to access /admin (and not login), user MUST be logged in.
  if (path.startsWith('/admin') && path !== '/admin/login') {
      if (!user) {
          // User is not logged in -> Redirect to Login
          const loginUrl = new URL('/admin/login', req.url);
          // Optional: Add ?next= to redirect back after login
          loginUrl.searchParams.set('next', path); 
          return NextResponse.redirect(loginUrl);
      }
  }

  // 3. LOGIN PROTECTION
  // If user is ALREADY logged in and tries to go to login, send them to dashboard
  if (path === '/admin/login' && user) {
      const dashboardUrl = new URL('/admin', req.url);
      return NextResponse.redirect(dashboardUrl);
  }

  // --- PHASE 5: SECURITY HEADERS 💉 ---
  
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  if (process.env.NODE_ENV === 'production') {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}