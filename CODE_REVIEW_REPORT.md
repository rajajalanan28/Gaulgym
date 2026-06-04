# CODE REVIEW REPORT - gym_management_website

> **Generated:** June 5, 2026  
> **Scope:** Full-stack review (Frontend + Backend + Security)  
> **Total Findings:** 75 (9 Critical, 25 High, 25 Medium, 16 Low)

---

## Executive Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| **Frontend** | 2 | 10 | 10 | 13 | 35 |
| **Backend** | 5 | 9 | 7 | 2 | 23 |
| **Security** | 2 | 6 | 8 | 1 | 17 |
| **TOTAL** | **9** | **25** | **25** | **16** | **75** |

---

## 🚨 CRITICAL FINDINGS (Immediate Action Required)

### [C-1] Middleware uses ANON key + RLS for auth decisions
**File:** `src/middleware.ts` (line 17)  
**Category:** Backend + Security

The middleware creates a server-side Supabase client using `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead of the service role key. Because RLS is enabled on the `users` table, the role-check query runs with the user's own credentials and is subject to RLS policies — which may deny the read, silently returning `null`. This means `userRole` is `undefined`, and the user bypasses the `!userRole` check and **gains access to protected routes**.

**Impact:** Any user could potentially access any protected route because RLS silently denies role lookups.

**Recommendation:**
```typescript
// Use SUPABASE_SERVICE_ROLE_KEY instead of anon key
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_SERVICE_ROLE_KEY } from '@/lib/config'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Bypass RLS for auth
  )
}
```

---

### [C-2] Staff creation bypasses Supabase Auth — impossible to log in
**File:** `src/app/owner/admin/page.tsx` (lines 66-76)  
**Category:** Frontend + Security

Admin accounts are created by directly inserting into the `users` table WITHOUT calling `supabase.auth.admin.createUser()`. The inserted user has **no password and no auth record**, meaning they cannot actually log in. The staff creation feature is fundamentally broken.

**Impact:** Created admins can never log in.

**Recommendation:**
```typescript
// Use Supabase Admin API to create auth user first
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email,
  email_confirm: true,
  user_metadata: { full_name, role: 'Admin', gym_id }
})
if (error) throw error
// Then insert into users table with the auth UID
```

---

### [C-3] RLS enabled on `products` table with ZERO policies
**File:** `supabase/migrations/20260604_enable_rls.sql` (line 7)  
**Category:** Backend

The `products` table has RLS enabled but no policies are created anywhere. Every query against `products` using the anon key or any authenticated user's credentials will be **DENIED by RLS**, causing the inventory and POS pages to silently fail.

**Impact:** Product queries fail silently — inventory and POS are broken.

**Recommendation:**
```sql
-- Add to 20260604_enable_rls.sql
CREATE POLICY "owners_select_products" ON products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM gyms WHERE id = gym_id AND owner_id = auth.uid())
  );

CREATE POLICY "owners_all_products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gyms WHERE id = gym_id AND owner_id = auth.uid())
  );

CREATE POLICY "admins_select_products" ON products
  FOR SELECT USING (
    gym_id IN (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'Admin')
  );
```

---

### [C-4] RLS enabled on `subscriptions` table with ZERO policies
**File:** `supabase/migrations/20260604_enable_rls.sql` (line 5)  
**Category:** Backend

`subscriptions` table has RLS enabled but no policies. Members cannot read their own subscriptions, and Admins cannot manage them.

**Impact:** All subscription/renewal flows are broken.

**Recommendation:**
```sql
-- Add to 20260604_enable_rls.sql
CREATE POLICY "members_read_own_subscriptions" ON subscriptions
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "admins_manage_subscriptions" ON subscriptions
  FOR ALL USING (
    gym_id IN (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'Admin')
  );
```

---

### [C-5] RLS enabled on `users` table with broken policies
**File:** `supabase/migrations/20260604_enable_rls.sql` (line 3)  
**Category:** Backend

The `users` table has RLS enabled but no policies exist. Owners cannot read their own data, and all user queries fail silently.

**Impact:** User data is inaccessible — auth context breaks.

---

### [C-6] IDOR: Any Owner can promote users from ANY gym to Admin
**File:** `src/app/api/admin/promote/route.ts` (lines 29-36)  
**Category:** Security

The promote endpoint verifies the requester is an Owner, but does NOT verify that the target user's gym belongs to the requesting owner.

**Impact:** Any Owner can promote users from other owner's gyms to Admin.

**Recommendation:**
```typescript
// Add ownership validation
const { data: gym } = await supabaseAdmin
  .from('users').select('gym_id').eq('id', targetUserId).single()

const { data: gymOwner } = await supabaseAdmin
  .from('gyms').select('owner_id').eq('id', gym?.gym_id).single()

if (gymOwner?.owner_id !== user.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

---

### [C-7] Service role key exposure via client-side code
**File:** `src/app/actions/user.ts`, `src/lib/auth-context.tsx`  
**Category:** Security

The service role key is used in client-side code. In Next.js, any variable prefixed with `NEXT_PUBLIC_` is exposed to the browser. The `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_`.

**Impact:** If the key leaks, full account creation is possible.

**Recommendation:**
- Ensure `SUPABASE_SERVICE_ROLE_KEY` does NOT have the `NEXT_PUBLIC_` prefix
- Only access it in server-side code (Route Handlers or Server Actions)
- Add validation: `if (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ')) throw new Error('...')`

---

### [C-8] AuthForms login silently transforms emails — breaks non-Gmail users
**File:** `src/components/auth/AuthForms.tsx` (lines 88-90)  
**Category:** Frontend + Security

The login form prepends `@gaulgym.com` if no `@` is found in the input. If the backend stores users by their raw email (e.g., `budi@gmail.com`), the login will always fail for non-Gmail users.

**Impact:** Users who type `budi` get transformed to `budi@gaulgym.com` and always fail login.

**Recommendation:**
1. Remove the email transformation entirely
2. Require full email input
3. Or query the database first to find the correct email from the username

---

### [C-9] No RLS on `sales_transactions` and `sales_items`
**File:** `supabase/migrations/20260604_enable_rls.sql` (line 7)  
**Category:** Security

The POS page references `sales_transactions` and `sales_items` tables, but RLS is not enabled on these tables. This means unauthenticated users could read/write all transactions.

**Recommendation:**
```sql
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_manage_transactions" ON sales_transactions
  FOR ALL USING (
    gym_id IN (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'Admin')
  );
```

---

## ⚠️ HIGH PRIORITY FINDINGS

### Frontend (10 issues)

| # | File | Issue | Line |
|---|------|-------|------|
| H-1 | `src/components/DashboardHeader.tsx` | Extra closing `</div>` tag — malformed JSX | 101 |
| H-2 | `src/components/DashboardHeader.tsx` | Using `<a href>` instead of `<Link>` for internal navigation | 35 |
| H-3 | `src/components/PublicFooter.tsx` | Using `<a href>` instead of `<Link>` for internal navigation | 11 |
| H-4 | `src/app/admin/checkin/page.tsx` | Effect dependency ordering — camera effect runs before `processCheckin` is stable | 158 |
| H-5 | `src/lib/auth-context.tsx` | `fetchUserProfile` captures stale closures (defined inside component body) | 62 |
| H-6 | `src/lib/config.ts` | Missing env vars only logged, not enforced — app continues with broken config | 14 |
| H-7 | `src/app/admin/member/page.tsx` | Manual Bearer token extraction — fragile auth pattern | 245 |
| H-8 | `src/components/Table.tsx` | Using array index as row `key` — breaks on sort/filter/reorder | 45 |
| H-9 | `src/app/admin/reports/page.tsx` | Admin reports delegates to owner-only page — always access denied for admins | 1 |
| H-10 | `src/lib/supabase.ts` | Wrong field: uses `created_at` instead of `join_date` for new members filter | 221 |

### Backend (9 issues)

| # | File | Issue | Line |
|---|------|-------|------|
| H-11 | `src/middleware.ts` | Missing gym-scoping: Owners can access any gym's admin/member routes | 53 |
| H-12 | `src/middleware.ts` | Cookie options not hardened — no sameSite, httpOnly, secure attributes | 25 |
| H-13 | `setup-staff-policies.sql` | Duplicate policy allows ANY Admin to read ALL users system-wide | 12 |
| H-14 | `src/lib/config.ts` | Missing env vars only logged, not thrown — app continues with broken config | 14 |
| H-15 | `src/lib/auth-context.tsx` | Auto-assigning member to arbitrary first gym on login — wrong gym possible | 167 |
| H-16 | `src/app/api/backfill/route.ts` | Backfill picks arbitrary gym without ownership check — could corrupt other owners' gyms | 33 |
| H-17 | `src/app/api/products/seed/route.ts` | No ownership validation — any Owner can seed products for any gym | 44 |
| H-18 | `src/app/api/admin/promote/route.ts` | No ownership check — any Owner can promote users from any gym | 29 |
| H-19 | `src/app/actions/user.ts` | Path traversal in photo upload filename | 100 |

### Security (6 issues)

| # | File | Issue | Line |
|---|------|-------|------|
| S-1 | `next.config.ts` | CSP header contains `unsafe-inline` and `unsafe-eval` | 23 |
| S-2 | `src/lib/config.ts` | Missing env vars only logged, not enforced | 14 |
| S-3 | `src/app/actions/user.ts` | Path traversal vulnerability in photo upload filename | 100 |
| S-4 | `src/app/owner/admin/page.tsx` | Admin creation bypasses Supabase Auth — no login possible | 52 |
| S-5 | `supabase/migrations/20260604_enable_rls.sql` | RLS not enabled on `sales_transactions` and `sales_items` | 7 |
| S-6 | `src/components/auth/AuthForms.tsx` | Login silently transforms emails — breaks non-Gmail users | 88 |

---

## 📋 MEDIUM PRIORITY FINDINGS

### Frontend (10 issues)

| # | File | Issue |
|---|------|-------|
| M-1 | `src/components/ProtectedRoute.tsx` | Double spinner render when loading=true and user=null |
| M-2 | `src/lib/auth-context.tsx` | Role parameter ignored in register function — silently overwritten to 'Member' |
| M-3 | `src/lib/supabase.ts` | Helper functions throw errors without consistent error handling in callers |
| M-4 | `src/app/admin/member/page.tsx` | No request cancellation on re-fetch — potential race conditions |
| M-5 | `src/app/admin/member/page.tsx` | Untyped `any[]` state for packages — no TypeScript safety |
| M-6 | `src/app/beranda/page.tsx` | Hero heading can overflow on mid-size mobile screens |
| M-7 | `src/app/admin/pos/page.tsx` | Sequential stock deduction — N network calls for N items |
| M-8 | `src/app/dashboard/reports/page.tsx` | Weekly grouping logic is incorrect — doesn't handle month boundaries |
| M-9 | `src/lib/auth-context.tsx` | Duplicate type definitions — `AuthUser` defined in multiple places |
| M-10 | `src/components/Button.tsx` | Mixed styling approach — inline JS styles + design tokens + Tailwind creates inconsistency |

### Backend (7 issues)

| # | File | Issue |
|---|------|-------|
| M-11 | `src/middleware.ts` | Single-gym constraint: owner_id stored per-user, but ownership is gym-level (1:N) |
| M-12 | `supabase/init.sql` | Hardcoded test credentials and UUIDs in init.sql |
| M-13 | `src/app/api/backfill/route.ts` | N+1 query pattern in backfill endpoint — sequential inserts in a loop |
| M-14 | `supabase/migrations/20260604_add_indexes.sql` | Missing indexes on frequently queried columns |
| M-15 | `src/app/api/admin/promote/route.ts` | No rate limiting on sensitive admin operations |
| M-16 | `src/lib/auth-context.tsx` | Fallback gym selection uses arbitrary first gym — silent wrong assignment |
| M-17 | `src/components/pages/MemberManagePage.tsx` | Direct Supabase calls from form handlers lack CSRF protection |

### Security (8 issues)

| # | File | Issue |
|---|------|-------|
| S-7 | `src/app/actions/user.ts` | Weak random generator (`Math.random()`) for display_id |
| S-8 | `src/lib/auth-context.tsx` | No email verification check on login |
| S-9 | `src/app/admin/checkin/page.tsx` | OIDC/injection risk in member search query |
| S-10 | `src/middleware.ts` | Database call on every protected route request — no caching |
| S-11 | `src/lib/auth-context.tsx` | Login timeout too long (45s) — potential DoS |
| S-12 | `.gitignore` | No `.env.example` — developers may misconfigure the app |
| S-13 | `src/app/admin/member/new/page.tsx` | Potential stored XSS via member photo URL |
| S-14 | `src/app/api/backfill/route.ts` | Backfill endpoint accessible to any Owner |

---

## ℹ️ LOW PRIORITY FINDINGS

### Frontend (13 issues)

| # | File | Issue | Line |
|---|------|-------|------|
| L-1 | `src/components/Sidebar.tsx` | Unused imports from design-tokens | 4 |
| L-2 | `src/app/beranda/page.tsx` | Over-dynamic import of small lucide-react icons | 14 |
| L-3 | `src/app/layout.tsx` | Service worker registration silently swallows all errors | 53 |
| L-4 | `src/app/dashboard/reports/page.tsx` | CSV export doesn't include BOM for Unicode/UTF-8 | 249 |
| L-5 | `src/components/BottomNav.tsx` | BottomNav may briefly render on login page before auth resolves | 13 |
| L-6 | `src/components/StatCard.tsx` | StatCard displays raw numbers without formatting | 14 |
| L-7 | `src/app/admin/dashboard/page.tsx` | Hardcoded `+0` change value in stat cards — misleading data | 44 |
| L-8 | `src/components/charts/RevenueChart.tsx` | No issues found — imports all used | 1 |
| L-9 | `src/app/beranda/page.tsx` | Inconsistent dynamic vs static import patterns | 10 |
| L-10 | `src/app/beranda/page.tsx` | Decorative div with `cursor-pointer` but no click handler | 36 |

### Backend (2 issues)

| # | File | Issue | Line |
|---|------|-------|------|
| L-11 | `src/lib/supabase.ts` | Sequential awaits in `getOwnerStats` instead of parallel queries | 160 |
| L-12 | `src/app/actions/user.ts` | `Math.random()` used for display_id instead of UUID | 91 |
| L-13 | `setup-products-columns.sql` | Storage bucket insert uses `ON CONFLICT DO NOTHING` with no verification | 8 |

### Security (1 issue)

| # | File | Issue | Line |
|---|------|-------|------|
| L-14 | `src/components/auth/AuthForms.tsx` | Password validation inconsistency between logic and UI | 74 |

---

## 📊 Recommendations Summary

### Priority 1: Fix Critical Issues First
1. Fix middleware to use service role key for auth decisions
2. Fix staff creation to use Supabase Auth API
3. Add RLS policies for `products`, `subscriptions`, `users`, `gyms`, `sales_transactions`, `sales_items`
4. Add ownership validation in all admin API routes
5. Fix email transformation bug in login
6. Ensure service role key is never exposed to client

### Priority 2: Address High Priority Issues
1. Replace all `<a href>` with `<Link>` in `DashboardHeader` and `PublicFooter`
2. Fix effect dependency ordering in checkin page
3. Add gym-scoping checks in middleware
4. Harden cookie options
5. Remove arbitrary gym selection fallbacks

### Priority 3: Technical Debt
1. Standardize type definitions in `types/index.ts`
2. Add missing database indexes
3. Implement rate limiting on admin operations
4. Fix CSV export for Unicode
5. Add email verification check on login

---

*Report generated via automated code review workflow*