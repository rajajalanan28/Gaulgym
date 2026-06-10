-- File: fix_auth_rls.sql
-- Description: Fixes infinite recursion in RLS policies and handles auto-registration of users/members.
-- IMPORTANT: Run this file in your Supabase SQL Editor.

-- 1. Fix the infinite recursion bug by rewriting get_auth_role() using plpgsql
-- This prevents PostgreSQL from inlining the function and ensures SECURITY DEFINER works correctly.
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM users WHERE id = auth.uid() LIMIT 1;
  RETURN v_role;
END;
$$;

-- Revoke permissions to avoid warnings, but allow authenticated execution
REVOKE EXECUTE ON FUNCTION public.get_auth_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO anon;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO service_role;

-- 2. Create a Database Trigger to automatically insert a user profile and member record
-- This is the recommended Supabase pattern for creating profiles upon sign up.
-- It fixes the "register sendiri gagal" issue caused by RLS blocking anonymous inserts.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_display_id TEXT;
BEGIN
  -- Default to 'Member' if not provided
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'Member');
  v_name := COALESCE(new.raw_user_meta_data->>'name', 'User Baru');

  -- Insert into public.users table
  INSERT INTO public.users (id, email, name, role, is_active)
  VALUES (new.id, new.email, v_name, v_role, true)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  -- If it is a Member, also create the public.members record
  IF v_role = 'Member' THEN
    v_display_id := 'GG-' || upper(substring(md5(random()::text) from 1 for 6));
    INSERT INTO public.members (user_id, email, name, join_date, display_id)
    VALUES (new.id, new.email, v_name, CURRENT_DATE, v_display_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
