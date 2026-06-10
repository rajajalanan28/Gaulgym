-- File: enable_rls_final.sql
-- Description: Enables Row Level Security (RLS) on all tables and creates policies.
-- IMPORTANT: Run this file in your Supabase SQL Editor.

-- 1. Create helper function for role checking (SECURITY DEFINER bypasses RLS to prevent infinite loops)
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Drop all existing policies to avoid conflicts
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename); 
    END LOOP; 
END $$;

-- 3. Enable RLS on all tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shifts ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for USERS
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Owner and Admin can view all users" ON users FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin') OR id = auth.uid());
CREATE POLICY "Owner can manage all users" ON users FOR ALL USING (get_auth_role() = 'Owner');

-- 5. Create Policies for MEMBERS
CREATE POLICY "Users can insert their own member record" ON members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Member can view own member data" ON members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Owner and Admin can view all members" ON members FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner and Admin can manage members" ON members FOR ALL USING (get_auth_role() IN ('Owner', 'Admin'));

-- 6. Create Policies for ATTENDANCE
CREATE POLICY "Owner and Admin can view all attendance" ON attendance FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner and Admin can manage attendance" ON attendance FOR ALL USING (get_auth_role() IN ('Owner', 'Admin'));

-- 7. Create Policies for SUBSCRIPTIONS
CREATE POLICY "Owner and Admin can view all subscriptions" ON subscriptions FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner and Admin can manage subscriptions" ON subscriptions FOR ALL USING (get_auth_role() IN ('Owner', 'Admin'));

-- 8. Create Policies for PACKAGES
CREATE POLICY "Public can view active packages" ON packages FOR SELECT USING (is_active = true);
CREATE POLICY "Owner and Admin can view all packages" ON packages FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner can manage packages" ON packages FOR ALL USING (get_auth_role() = 'Owner');

-- 9. Create Policies for PRODUCTS
CREATE POLICY "Public can view products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Owner and Admin can view all products" ON products FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner can manage products" ON products FOR ALL USING (get_auth_role() = 'Owner');

-- 10. Create Policies for SALES
CREATE POLICY "Owner and Admin can view all sales" ON sales_transactions FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner and Admin can insert sales" ON sales_transactions FOR INSERT WITH CHECK (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner and Admin can view sales items" ON sales_items FOR SELECT USING (get_auth_role() IN ('Owner', 'Admin'));
CREATE POLICY "Owner and Admin can insert sales items" ON sales_items FOR INSERT WITH CHECK (get_auth_role() IN ('Owner', 'Admin'));
