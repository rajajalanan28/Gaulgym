-- Tambahkan kolom image_url dan stock pada tabel products
ALTER TABLE public.products
ADD COLUMN image_url TEXT,
ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;

-- Buat bucket storage untuk product-images jika memungkinkan lewat SQL
-- Note: Supabase Storage buckets biasanya dibuat lewat Dashboard, tapi kita coba insert metadata
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Berikan akses public untuk melihat (SELECT) gambar di bucket product-images
CREATE POLICY "Public Access for product images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Izinkan user (Owner/Admin yang login) untuk mengunggah gambar ke bucket product-images
CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Izinkan user untuk update gambar
CREATE POLICY "Authenticated users can update product images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
