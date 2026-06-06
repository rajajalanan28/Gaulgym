-- Allow owners to read users they own (Admins they created)
-- This is necessary because Admins might not be assigned to a specific gym yet
CREATE POLICY "owners_read_own_admins" ON users
  FOR SELECT USING (owner_id = auth.uid());
