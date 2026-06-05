import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Architecture Note (M-11): This middleware assumes a 1:N owner-to-gym relationship.
 * A single Owner can own multiple gyms, but each Admin/Member belongs to exactly one gym
 * (via users.gym_id). Gym-scoping (H-11) restricts route access to users whose gym_id
 * matches the gym context derived from the URL. If the app later supports users belonging
 * to multiple gyms, this middleware and the users.gym_id schema must be updated.
 */

const protectedRoutes: Record<string, string[]> = {
  '/owner': ['Owner'],
  '/admin': ['Owner', 'Admin'],
  '/member': ['Owner', 'Admin', 'Member'],
};

/** Name of the cookie used to cache the user's role + gym_id between requests (S-10). */
const ROLE_CACHE_COOKIE = 'x-user-role-cache';
/** Cache TTL in seconds — role is re-fetched from DB after this period. */
const ROLE_CACHE_TTL_SECONDS = 300; // 5 minutes

interface RoleCachePayload {
  role: string;
  gym_id: string | null;
  /** Timestamp (ms) when the cache was written. */
  ts: number;
}

function parseRoleCache(raw: string | undefined): RoleCachePayload | null {
  if (!raw) return null;
  try {
    const parsed: RoleCachePayload = JSON.parse(raw);
    if (
      typeof parsed.role !== 'string' ||
      typeof parsed.ts !== 'number'
    ) {
      return null;
    }
    const ageMs = Date.now() - parsed.ts;
    if (ageMs > ROLE_CACHE_TTL_SECONDS * 1000 || ageMs < 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // H-12: Hardened cookie options — sameSite, httpOnly, secure
  const hardenedCookieDefaults: Partial<CookieOptions> = {
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
  };

  // We use the ANON key to verify the session. Service role key is only needed for DB queries.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in middleware.');
    // Let client handle it to avoid infinite redirect loops
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          const merged = { ...hardenedCookieDefaults, ...options };
          request.cookies.set({ name, value, ...merged });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...merged });
        },
        remove(name: string, options: CookieOptions) {
          const merged = { ...hardenedCookieDefaults, ...options };
          request.cookies.set({ name, value: '', ...merged });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...merged });
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
      // Clear stale role cache on logout
      response.cookies.delete(ROLE_CACHE_COOKIE);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  if (isProtectedRoute) {
    let userRole: string | undefined;
    let userGymId: string | null = null;

    // S-10: Try to read cached role from cookie to avoid a DB call on every request.
    const cachedRaw = request.cookies.get(ROLE_CACHE_COOKIE)?.value;
    const cached = parseRoleCache(cachedRaw);

    if (cached) {
      userRole = cached.role;
      userGymId = cached.gym_id;
    } else if (supabaseServiceKey) {
      // Cache miss or expired — fetch from DB using service role key (bypasses RLS).
      const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
      
      const { data: userData } = await adminAuthClient
        .from('users')
        .select('role, gym_id')
        .eq('id', session.user.id)
        .single();

      userRole = userData?.role;
      userGymId = userData?.gym_id ?? null;

      // Write the result into a short-lived cookie for subsequent requests.
      if (userRole) {
        const payload: RoleCachePayload = {
          role: userRole,
          gym_id: userGymId,
          ts: Date.now(),
        };
        response.cookies.set({
          name: ROLE_CACHE_COOKIE,
          value: JSON.stringify(payload),
          path: '/',
          maxAge: ROLE_CACHE_TTL_SECONDS,
          ...hardenedCookieDefaults,
        });
      }
    } else {
      // If no service key, we can't reliably check role here due to RLS.
      // Allow it to pass, client-side ProtectedRoute will catch unauthorized access.
      return response;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      const redirectPath = userRole === 'Owner' ? '/owner/dashboard'
        : userRole === 'Admin' ? '/admin/dashboard'
        : '/member/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // H-11: Gym-scoping — ensure non-Owner users can only access routes for their own gym.
    // Owners may manage multiple gyms so they are allowed broader access,
    // but Admins and Members must only access resources scoped to their gym_id.
    // If the URL contains a gym_id segment (e.g. /admin/gym/<gym_id>/...),
    // validate it matches the user's gym_id.
    if (userRole !== 'Owner' && userGymId) {
      const gymIdInPath = extractGymIdFromPath(pathname);
      if (gymIdInPath && gymIdInPath !== userGymId) {
        // Admin/Member is trying to access a gym that isn't theirs — redirect.
        const redirectPath = userRole === 'Admin' ? '/admin/dashboard' : '/member/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // H-11: For Owners, verify they actually own the gym referenced in the URL.
    // This prevents Owner A from accessing Owner B's gym routes.
    if (userRole === 'Owner') {
      const gymIdInPath = extractGymIdFromPath(pathname);
      if (gymIdInPath) {
        const { data: gymData } = await supabase
          .from('gyms')
          .select('id')
          .eq('id', gymIdInPath)
          .eq('owner_id', session.user.id)
          .single();

        if (!gymData) {
          // Owner does not own this gym — redirect to their own dashboard.
          return NextResponse.redirect(new URL('/owner/dashboard', request.url));
        }
      }
    }
  }

  return response;
}

/**
 * Extracts a gym UUID from the URL path if present.
 * Looks for a UUID segment that follows a "gym" or "gyms" segment,
 * or any UUID-shaped path segment in known positions.
 *
 * Supports patterns like:
 *   /admin/gym/<uuid>/...
 *   /owner/gyms/<uuid>/...
 */
function extractGymIdFromPath(pathname: string): string | null {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const segments = pathname.split('/').filter(Boolean);
  for (let i = 0; i < segments.length; i++) {
    if (/^gyms?$/i.test(segments[i]) && i + 1 < segments.length) {
      const next = segments[i + 1];
      if (uuidRegex.test(next)) {
        return next.toLowerCase();
      }
    }
  }
  return null;
}

export const config = {
  matcher: [
    '/owner/:path*',
    '/admin/:path*',
    '/member/:path*',
  ],
};
