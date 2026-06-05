-- Fix infinite recursion in RLS policies by using SECURITY DEFINER functions
-- to look up user roles and gym_ids without triggering RLS recursively.

CREATE OR REPLACE FUNCTION get_auth_gym_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT gym_id FROM users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

-- Drop the recursive policy on users table
DROP POLICY IF EXISTS "admins_read_gym_users" ON users;

-- Recreate it using the secure functions
CREATE POLICY "admins_read_gym_users" ON users
  FOR SELECT USING (
    gym_id = get_auth_gym_id() AND get_auth_role() = 'Admin'
  );

-- Note: Policies on other tables (like members, attendance, etc.) that query the users table 
-- (e.g., SELECT gym_id FROM users WHERE id = auth.uid()) are no longer part of an infinite
-- loop because the users table itself no longer recurses. However, for performance and 
-- consistency, we could update them later to use these functions as well.
