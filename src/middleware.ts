import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- CONFIGURATION ---

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// 2. Initialize Redis (Safe Init)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const ratelimitPublic = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "10 s"),
});

const ratelimitSensitive = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const hostname = req.headers.get("host") || "";

  // --- PHASE 1: SECURITY SHIELD (Rate Limiting) 🛡️ ---
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
      // Fail open: If Redis fails, let the user pass rather than crashing
    }
  }

  // --- PHASE 2: SUBDOMAIN & ROUTING PREP 🌐 ---
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  let subdomain = "app"; 
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  
  if (!isLocalhost && hostname) {
      const currentHost = hostname.replace(`.${rootDomain}`, "");
      if (currentHost !== hostname) {
          subdomain = currentHost;
      }
  }

  if (url.searchParams.has("site")) {
      subdomain = url.searchParams.get("site")!;
  }

  // --- PHASE 3: CREATE RESPONSE OBJECT 🚦 ---
  // We initialize the response early so Supabase can attach cookies to it
  let response = NextResponse.next({
    request: { headers: req.headers },
  });

  // Security Headers
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === 'production') {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // --- PHASE 4: SUPABASE AUTH (The Crash Fix) 🔐 ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: req.headers },
          });
          response.cookies.set({ name, value, ...options }); 
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: req.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 🛡️ SAFELY CHECK USER (Prevents 500 Error Loop)
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) user = data.user;
  } catch (err) {
    // If token is malformed, ignore it. User stays null.
    console.error("Auth Middleware Error:", err);
  }

  // --- PHASE 5: ROUTING LOGIC ---

  // A. Admin Redirect Safety (Subdomain -> Main Domain)
  if (subdomain !== "app" && subdomain !== "www" && path.startsWith("/admin")) {
      const mainAppUrl = new URL(path, req.url);
      mainAppUrl.hostname = isLocalhost ? "localhost" : rootDomain;
      mainAppUrl.port = url.port;
      return NextResponse.redirect(mainAppUrl);
  }

  // B. REWRITE LOGIC (Subdomains)
  if (subdomain !== "app" && subdomain !== "www") {
      const newUrl = new URL(`/sites/${subdomain}${path}`, req.url);
      newUrl.search = url.search;
      
      // We must recreate the response object as a rewrite, but KEEP the cookies we set earlier
      // This is the tricky part with Supabase middleware
      const rewriteResponse = NextResponse.rewrite(newUrl, {
          request: { headers: req.headers },
      });
      
      // Copy over any cookies/headers set by Supabase or Security
      rewriteResponse.headers.forEach((v, k) => response.headers.set(k, v));
      response.cookies.getAll().forEach((c) => rewriteResponse.cookies.set(c));
      
      response = rewriteResponse;
  }

  // C. ADMIN AUTH PROTECTION
  if (path.startsWith('/admin')) {
    // 1. If trying to login while ALREADY logged in -> Go to Dashboard
    if (path === '/admin/login' && user) {
       const dashboardUrl = new URL('/admin', req.url);
       return NextResponse.redirect(dashboardUrl);
    }
    
    // 2. If trying to access protected admin area while LOGGED OUT -> Go to Login
    if (path !== '/admin/login' && !user) {
       const loginUrl = new URL('/admin/login', req.url);
       loginUrl.searchParams.set('next', path); 
       return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}