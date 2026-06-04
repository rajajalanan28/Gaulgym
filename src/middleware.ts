import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes: Record<string, string[]> = {
  '/owner': ['Owner'],
  '/admin': ['Owner', 'Admin'],
  '/member': ['Owner', 'Admin', 'Member'],
};

export async function middleware(request: NextRequest) {
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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;

  let isProtectedRoute = false;
  let allowedRoles: string[] = [];

  for (const [routePrefix, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      isProtectedRoute = true;
      allowedRoles = roles;
      break;
    }
  }

  if (!session) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  if (isProtectedRoute) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const userRole = userData?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      const redirectPath = userRole === 'Owner' ? '/owner/dashboard' 
        : userRole === 'Admin' ? '/admin/dashboard' 
        : '/member/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/owner/:path*',
    '/admin/:path*',
    '/member/:path*',
  ],
};
