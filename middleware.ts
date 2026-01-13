import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isRateLimited } from '@/lib/rate-limit'; 

export async function middleware(request: NextRequest) {
  // 1. RATE LIMITING
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/admin')) {
    if (isRateLimited(request)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please slow down.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 4. CHECK USER SESSION
  const { data: { user } } = await supabase.auth.getUser();

  // 5. PROTECTED ROUTES: Admin Panel
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // A. User must be logged in
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }

    // B. User must have 'admin' role (The New Security Layer)
    // We check app_metadata because users cannot spoof this.
    if (user.app_metadata?.role !== 'admin') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/'; // Kick them to homepage
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 6. AUTH ROUTES: Redirect logged-in ADMINS away from login
  // Regular users can still access login page if they want (or you can redirect them to profile)
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (user && user.app_metadata?.role === 'admin') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin/inventory';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/login', 
    '/api/:path*'
  ],
};