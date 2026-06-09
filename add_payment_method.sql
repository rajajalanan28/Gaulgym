-- Jalankan script ini di SQL Editor Supabase untuk nambahin kolom payment_method

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash';

-- Catatan:
-- Ini bakal nyimpen metode pembayaran (contoh: 'Cash' atau 'Transfer') 
-- tiap kali member perpanjang paket.
