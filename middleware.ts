import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isRateLimited } from '@/lib/rate-limit'; 

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. RATE LIMITING (Keep this!)
  if (path.startsWith('/api') || path.startsWith('/admin')) {
    if (isRateLimited(request)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please slow down.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. INITIALIZE SUPABASE (Keep this for data access & future features)
  // We create the response first so we can attach cookies to it later
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
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

  // 3. REFRESH SESSION (Keep this invisible background work)
  // This ensures your supabase client stays valid
  await supabase.auth.getUser();


  // ============================================================
  // 4. ADMIN PROTECTION (UPDATED FOR SUDO MODE)
  // ============================================================
  
  if (path.startsWith('/admin')) {
    
    // A. Allow access to the login page itself (avoid infinite loop)
    if (path === '/admin/login') {
      return response;
    }

    // B. Check for the SUDO COOKIE (The new Step 8 Logic)
    const adminSession = request.cookies.get('admin_session');

    // C. If cookie is missing, kick them to the Admin Login
    if (!adminSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      // Remember where they wanted to go
      loginUrl.searchParams.set('next', path); 
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. REDIRECT FROM LOGIN (Optional Polish)
  // If they are already logged in as Admin and try to visit /admin/login
  if (path === '/admin/login') {
     const adminSession = request.cookies.get('admin_session');
     if (adminSession) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/admin/inventory'; // Default to Inventory
        return NextResponse.redirect(dashboardUrl);
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