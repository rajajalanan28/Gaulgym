-- Aktifkan RLS di tabel users jika belum
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Izinkan user (Owner) untuk menambahkan admin baru
CREATE POLICY "Owner can insert staff" 
ON public.users FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Izinkan user untuk melihat dirinya sendiri dan admin bawahannya
CREATE POLICY "User can view themselves and their staff" 
ON public.users FOR SELECT 
USING (id = auth.uid() OR owner_id = auth.uid() OR role = 'Admin');

-- Izinkan Owner untuk update status admin bawahannya
CREATE POLICY "Owner can update their staff" 
ON public.users FOR UPDATE 
USING (owner_id = auth.uid() OR id = auth.uid());
