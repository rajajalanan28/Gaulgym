-- File: fix_security_warnings.sql
-- Description: Fixes Security Advisor warnings and missing policies for expenses/shifts

-- 1. Add missing policies for Expenses
CREATE POLICY "Owner and Admin can view all expenses" ON expenses FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner and Admin can manage expenses" ON expenses FOR ALL USING (get_auth_role() IN ('Owner', 'Admin'));

-- 2. Add missing policies for Shifts
CREATE POLICY "Owner and Admin can view all shifts" ON shifts FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner and Admin can manage shifts" ON shifts FOR ALL USING (get_auth_role() IN ('Owner', 'Admin'));

-- 3. Fix "Public Can Execute SECURITY DEFINER" for POS transaction
-- Revoke from PUBLIC (everyone) and only allow authenticated users to execute it
REVOKE EXECUTE ON FUNCTION public.process_pos_transaction(uuid, numeric, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_pos_transaction(uuid, numeric, text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.process_pos_transaction(uuid, numeric, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_pos_transaction(uuid, numeric, text, jsonb) TO service_role;

-- 4. Clean up legacy function that is no longer used
DROP FUNCTION IF EXISTS public.get_auth_gym_id();

-- Note on get_auth_role():
-- We intentionally leave get_auth_role() accessible because it is used by Row-Level Security (RLS) 
-- policies for anonymous users viewing active packages/products. It is safe because it only 
-- reads the role of the caller (auth.uid()) and returns null for anonymous users.
