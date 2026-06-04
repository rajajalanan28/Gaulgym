-- ============= ENABLE RLS =============
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- C-9/S-5: Enable RLS on sales_transactions and sales_items
-- These tables previously had NO RLS at all, leaving them fully exposed.
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_items ENABLE ROW LEVEL SECURITY;

-- ============= USERS POLICIES (C-5) =============

-- Users can read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Owners can read all users in their gym
-- Fixed (C-5): The original policy incorrectly checked role = 'Owner' on the
-- TARGET row instead of the REQUESTING user. Now uses a subquery to verify the
-- requesting user is an Owner and scopes to their gym(s).
CREATE POLICY "owners_read_gym_users" ON users
  FOR SELECT USING (
    gym_id IN (
      SELECT g.id FROM gyms g
      WHERE g.owner_id = auth.uid()
    )
  );

-- Admins can read users in their own gym (C-5)
CREATE POLICY "admins_read_gym_users" ON users
  FOR SELECT USING (
    gym_id = (
      SELECT u.gym_id FROM users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );

-- Owners can create users in their gym
-- Fixed: Same issue as owners_read_gym_users — checks the requesting user is
-- an Owner via the gyms table.
CREATE POLICY "owners_create_users" ON users
  FOR INSERT WITH CHECK (
    gym_id IN (
      SELECT g.id FROM gyms g
      WHERE g.owner_id = auth.uid()
    )
  );

-- ============= MEMBERS POLICIES =============

-- Members can read their own data
CREATE POLICY "members_read_own" ON members
  FOR SELECT USING (user_id = auth.uid());

-- Admins can read all members in their gym
CREATE POLICY "admins_read_gym_members" ON members
  FOR SELECT USING (
    gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
  );

-- Admins can insert members in their gym
CREATE POLICY "admins_insert_members" ON members
  FOR INSERT WITH CHECK (
    gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
  );

-- Admins can update members in their gym
CREATE POLICY "admins_update_members" ON members
  FOR UPDATE USING (
    gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
  );

-- Owners can delete members in their gym
CREATE POLICY "owners_delete_members" ON members
  FOR DELETE USING (
    gym_id IN (
      SELECT gym_id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- ============= ATTENDANCE POLICIES =============

-- Members can read their own attendance
CREATE POLICY "members_read_own_attendance" ON attendance
  FOR SELECT USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- Admins can manage attendance in their gym
CREATE POLICY "admins_manage_attendance" ON attendance
  FOR ALL USING (
    gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
  );

-- ============= PRODUCTS POLICIES (C-3) =============
-- Previously had RLS enabled but ZERO policies, effectively blocking all access.

-- Owners: full access to products belonging to their gym(s)
CREATE POLICY "owners_manage_products" ON products
  FOR ALL USING (
    gym_id IN (
      SELECT g.id FROM gyms g
      WHERE g.owner_id = auth.uid()
    )
  );

-- Admins: can read products in their own gym
CREATE POLICY "admins_read_products" ON products
  FOR SELECT USING (
    gym_id = (
      SELECT u.gym_id FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('Admin')
    )
  );

-- ============= SUBSCRIPTIONS POLICIES (C-4) =============
-- Previously had RLS enabled but ZERO policies.

-- Members: can read their own subscriptions
CREATE POLICY "members_read_own_subscriptions" ON subscriptions
  FOR SELECT USING (
    member_id IN (
      SELECT m.id FROM members m WHERE m.user_id = auth.uid()
    )
  );

-- Admins: can manage (CRUD) subscriptions for their gym
CREATE POLICY "admins_manage_subscriptions" ON subscriptions
  FOR ALL USING (
    gym_id = (
      SELECT u.gym_id FROM users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );

-- Owners: full access to subscriptions belonging to their gym(s)
CREATE POLICY "owners_manage_subscriptions" ON subscriptions
  FOR ALL USING (
    gym_id IN (
      SELECT g.id FROM gyms g
      WHERE g.owner_id = auth.uid()
    )
  );

-- ============= SALES_TRANSACTIONS POLICIES (C-9/S-5) =============
-- These tables previously had NO RLS, leaving data fully exposed.

-- Admins: full access to their gym's sales transactions
CREATE POLICY "admins_manage_sales_transactions" ON sales_transactions
  FOR ALL USING (
    gym_id = (
      SELECT u.gym_id FROM users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );

-- Owners: full access to their gym(s)' sales transactions
CREATE POLICY "owners_manage_sales_transactions" ON sales_transactions
  FOR ALL USING (
    gym_id IN (
      SELECT g.id FROM gyms g
      WHERE g.owner_id = auth.uid()
    )
  );

-- ============= SALES_ITEMS POLICIES (C-9/S-5) =============

-- Admins: full access to sales items via the parent transaction's gym
CREATE POLICY "admins_manage_sales_items" ON sales_items
  FOR ALL USING (
    transaction_id IN (
      SELECT st.id FROM sales_transactions st
      WHERE st.gym_id = (
        SELECT u.gym_id FROM users u
        WHERE u.id = auth.uid() AND u.role = 'Admin'
      )
    )
  );

-- Owners: full access to sales items via the parent transaction's gym
CREATE POLICY "owners_manage_sales_items" ON sales_items
  FOR ALL USING (
    transaction_id IN (
      SELECT st.id FROM sales_transactions st
      WHERE st.gym_id IN (
        SELECT g.id FROM gyms g
        WHERE g.owner_id = auth.uid()
      )
    )
  );
