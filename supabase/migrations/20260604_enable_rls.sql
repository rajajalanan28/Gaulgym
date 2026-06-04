-- ============= ENABLE RLS =============
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============= USERS POLICIES =============

-- Users can read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Owners can read all users in their gym
CREATE POLICY "owners_read_gym_users" ON users
  FOR SELECT USING (
    role = 'Owner' AND (
      gym_id IN (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'Owner')
      OR gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
    )
  );

-- Owners can create users in their gym
CREATE POLICY "owners_create_users" ON users
  FOR INSERT WITH CHECK (
    role = 'Owner' AND (
      gym_id = (SELECT gym_id FROM users WHERE id = auth.uid() AND role = 'Owner')
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
