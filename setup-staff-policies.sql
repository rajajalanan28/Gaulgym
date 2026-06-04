-- H-13: Fixed — the original "User can view themselves and their staff" policy
-- contained `OR role = 'Admin'` which allowed ANY Admin to read ALL user rows
-- system-wide, regardless of gym. This has been replaced with gym-scoped
-- policies below.

-- Aktifkan RLS di tabel users jika belum
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Izinkan user (Owner) untuk menambahkan admin baru ke gym yang mereka miliki.
CREATE POLICY "Owner can insert staff"
ON public.users FOR INSERT
WITH CHECK (
  gym_id IN (
    SELECT g.id FROM gyms g WHERE g.owner_id = auth.uid()
  )
);

-- Users can view themselves.
CREATE POLICY "User can view self"
ON public.users FOR SELECT
USING (id = auth.uid());

-- Owners can view staff (admins/members) in gyms they own.
CREATE POLICY "Owner can view their gym staff"
ON public.users FOR SELECT
USING (
  gym_id IN (
    SELECT g.id FROM gyms g WHERE g.owner_id = auth.uid()
  )
);

-- Admins can view users in their OWN gym only.
-- Fixed (H-13): Previously `role = 'Admin'` allowed any Admin to see all users.
CREATE POLICY "Admin can view their gym users"
ON public.users FOR SELECT
USING (
  gym_id = (
    SELECT u.gym_id FROM users u
    WHERE u.id = auth.uid() AND u.role = 'Admin'
  )
);

-- Izinkan Owner untuk update status admin bawahannya
CREATE POLICY "Owner can update their staff"
ON public.users FOR UPDATE
USING (owner_id = auth.uid() OR id = auth.uid());
