-- 20260609_remove_gym_branches.sql

-- 1. Drop existing RLS policies that rely on gym_id
DROP POLICY IF EXISTS "Owner can view their own users" ON users;
DROP POLICY IF EXISTS "Admin can view users in same gym" ON users;
DROP POLICY IF EXISTS "Admin can view members in their gym" ON members;
DROP POLICY IF EXISTS "Owner can view all members in their gyms" ON members;
DROP POLICY IF EXISTS "Member can view own member data" ON members;
DROP POLICY IF EXISTS "Admin can insert members in their gym" ON members;
DROP POLICY IF EXISTS "Owner can insert members in their gyms" ON members;
DROP POLICY IF EXISTS "Admin can update members in their gym" ON members;
DROP POLICY IF EXISTS "Owner can update members in their gyms" ON members;

DROP POLICY IF EXISTS "Admin can view attendance in their gym" ON attendance;
DROP POLICY IF EXISTS "Owner can view attendance in their gyms" ON attendance;
DROP POLICY IF EXISTS "Member can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Admin can insert attendance in their gym" ON attendance;
DROP POLICY IF EXISTS "Owner can insert attendance in their gyms" ON attendance;
DROP POLICY IF EXISTS "Admin can update attendance in their gym" ON attendance;
DROP POLICY IF EXISTS "Owner can update attendance in their gyms" ON attendance;

DROP POLICY IF EXISTS "Admin can view subscriptions in their gym" ON subscriptions;
DROP POLICY IF EXISTS "Owner can view subscriptions in their gyms" ON subscriptions;
DROP POLICY IF EXISTS "Member can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admin can insert subscriptions in their gym" ON subscriptions;
DROP POLICY IF EXISTS "Owner can insert subscriptions in their gyms" ON subscriptions;
DROP POLICY IF EXISTS "Admin can update subscriptions in their gym" ON subscriptions;
DROP POLICY IF EXISTS "Owner can update subscriptions in their gyms" ON subscriptions;

DROP POLICY IF EXISTS "Admin can view packages in their gym" ON packages;
DROP POLICY IF EXISTS "Owner can view packages in their gyms" ON packages;
DROP POLICY IF EXISTS "Public can view active packages" ON packages;
DROP POLICY IF EXISTS "Owner can insert packages in their gyms" ON packages;
DROP POLICY IF EXISTS "Owner can update packages in their gyms" ON packages;
DROP POLICY IF EXISTS "Owner can delete packages in their gyms" ON packages;

DROP POLICY IF EXISTS "Admin can view products in their gym" ON products;
DROP POLICY IF EXISTS "Owner can view products in their gyms" ON products;

DROP POLICY IF EXISTS "Admin can view sales in their gym" ON sales_transactions;
DROP POLICY IF EXISTS "Owner can view sales in their gyms" ON sales_transactions;

-- 2. Drop constraints and columns from all tables
ALTER TABLE users DROP COLUMN IF EXISTS gym_id CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS owner_id CASCADE;

ALTER TABLE packages DROP COLUMN IF EXISTS gym_id CASCADE;
ALTER TABLE members DROP COLUMN IF EXISTS gym_id CASCADE;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS gym_id CASCADE;
ALTER TABLE attendance DROP COLUMN IF EXISTS gym_id CASCADE;

-- Attempt to drop from tables that might have been created dynamically
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gym_id') THEN
        ALTER TABLE products DROP COLUMN gym_id CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_transactions' AND column_name = 'gym_id') THEN
        ALTER TABLE sales_transactions DROP COLUMN gym_id CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'gym_id') THEN
        ALTER TABLE shifts DROP COLUMN gym_id CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'gym_id') THEN
        ALTER TABLE expenses DROP COLUMN gym_id CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_summaries' AND column_name = 'gym_id') THEN
        ALTER TABLE daily_summaries DROP COLUMN gym_id CASCADE;
    END IF;
END $$;

-- 3. Drop the gyms table entirely
DROP TABLE IF EXISTS gyms CASCADE;

-- 4. Re-create Simplified RLS Policies (Single-Tenant)

-- For Users
CREATE POLICY "Owner and Admin can view all users" ON users FOR SELECT 
USING (get_auth_role() IN ('Owner', 'Admin') OR id = auth.uid());

CREATE POLICY "Owner can manage all users" ON users FOR ALL
USING (get_auth_role() = 'Owner');

-- For Members
CREATE POLICY "Owner and Admin can view all members" ON members FOR SELECT
USING (get_auth_role() IN ('Owner', 'Admin'));

CREATE POLICY "Member can view own member data" ON members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Owner and Admin can manage members" ON members FOR ALL
USING (get_auth_role() IN ('Owner', 'Admin'));

-- For Attendance
CREATE POLICY "Owner and Admin can view all attendance" ON attendance FOR SELECT
USING (get_auth_role() IN ('Owner', 'Admin'));

CREATE POLICY "Member can view own attendance" ON attendance FOR SELECT
USING (member_name = (SELECT name FROM users WHERE id = auth.uid())); -- Simplified for demo

CREATE POLICY "Owner and Admin can manage attendance" ON attendance FOR ALL
USING (get_auth_role() IN ('Owner', 'Admin'));

-- For Subscriptions
CREATE POLICY "Owner and Admin can view all subscriptions" ON subscriptions FOR SELECT
USING (get_auth_role() IN ('Owner', 'Admin'));

CREATE POLICY "Owner and Admin can manage subscriptions" ON subscriptions FOR ALL
USING (get_auth_role() IN ('Owner', 'Admin'));

-- For Packages
CREATE POLICY "Public can view active packages" ON packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Owner and Admin can view all packages" ON packages FOR SELECT
USING (get_auth_role() IN ('Owner', 'Admin'));

CREATE POLICY "Owner can manage packages" ON packages FOR ALL
USING (get_auth_role() = 'Owner');

-- Fallback for products and sales if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        EXECUTE 'CREATE POLICY "Owner and Admin can view all products" ON products FOR SELECT USING (get_auth_role() IN (''Owner'', ''Admin''))';
        EXECUTE 'CREATE POLICY "Owner can manage products" ON products FOR ALL USING (get_auth_role() = ''Owner'')';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_transactions') THEN
        EXECUTE 'CREATE POLICY "Owner and Admin can view all sales" ON sales_transactions FOR SELECT USING (get_auth_role() IN (''Owner'', ''Admin''))';
        EXECUTE 'CREATE POLICY "Owner and Admin can insert sales" ON sales_transactions FOR INSERT WITH CHECK (get_auth_role() IN (''Owner'', ''Admin''))';
    END IF;
END $$;
