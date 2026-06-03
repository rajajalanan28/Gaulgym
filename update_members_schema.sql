-- Jalankan script ini di SQL Editor Supabase untuk update fitur Kartu Member & Kamera

-- Tambahkan kolom photo_url dan qr_code di tabel members
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS qr_code UUID DEFAULT extensions.uuid_generate_v4();

-- Beri policy public read untuk bucket storage kalau perlu (opsional, tapi kita set via dashboard saja)
