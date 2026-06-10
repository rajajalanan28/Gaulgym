-- Menghapus kolom gym_id dari tabel shifts (dan tabel kasir lainnya) jika masih nyangkut
DO $$ 
BEGIN
    -- Hapus dari shifts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'gym_id') THEN
        ALTER TABLE shifts DROP COLUMN gym_id CASCADE;
    END IF;

    -- Hapus dari expenses (opsional, buat jaga-jaga)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'gym_id') THEN
        ALTER TABLE expenses DROP COLUMN gym_id CASCADE;
    END IF;

    -- Hapus dari daily_summaries (opsional, buat jaga-jaga)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_summaries' AND column_name = 'gym_id') THEN
        ALTER TABLE daily_summaries DROP COLUMN gym_id CASCADE;
    END IF;

    -- Hapus dari products (opsional, buat jaga-jaga)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gym_id') THEN
        ALTER TABLE products DROP COLUMN gym_id CASCADE;
    END IF;

    -- Hapus dari sales_transactions (opsional, buat jaga-jaga)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_transactions' AND column_name = 'gym_id') THEN
        ALTER TABLE sales_transactions DROP COLUMN gym_id CASCADE;
    END IF;
END $$;
