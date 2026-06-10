-- File: setup_void_logs.sql
-- Description: Create voided_logs table and update the void_pos_transaction RPC.

-- 1. Create table for audit logs
CREATE TABLE IF NOT EXISTS voided_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL,
    admin_id UUID NOT NULL REFERENCES users(id),
    total_amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    items_snapshot JSONB NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for voided_logs
ALTER TABLE voided_logs ENABLE ROW LEVEL SECURITY;

-- Owner can read all voided logs
DROP POLICY IF EXISTS "Owner can view voided logs" ON voided_logs;
CREATE POLICY "Owner can view voided logs" ON voided_logs
    FOR SELECT USING (get_auth_role() = 'Owner');

-- Admin can insert voided logs (via RPC mostly, but good to have)
DROP POLICY IF EXISTS "Admin can insert voided logs" ON voided_logs;
CREATE POLICY "Admin can insert voided logs" ON voided_logs
    FOR INSERT WITH CHECK (get_auth_role() IN ('Admin', 'Owner'));

-- 2. Update RPC to require a reason and log it
CREATE OR REPLACE FUNCTION void_pos_transaction(
  p_transaction_id UUID,
  p_admin_id UUID,
  p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_tx RECORD;
  v_items_snapshot JSONB;
BEGIN
  -- 1. Pastikan transaksi ini ada dan ambil datanya
  SELECT * INTO v_tx FROM sales_transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaksi tidak ditemukan';
  END IF;

  IF TRIM(p_reason) = '' THEN
    RAISE EXCEPTION 'Alasan pembatalan wajib diisi';
  END IF;

  -- Bikin snapshot JSON dari items
  SELECT jsonb_agg(
      jsonb_build_object(
          'product_id', si.product_id,
          'quantity', si.quantity,
          'price', si.price,
          'product_name', p.name
      )
  ) INTO v_items_snapshot
  FROM sales_items si
  JOIN products p ON p.id = si.product_id
  WHERE si.transaction_id = p_transaction_id;

  -- 2. Kembalikan stok untuk setiap barang yang dibeli di transaksi ini
  FOR v_item IN SELECT product_id, quantity FROM sales_items WHERE transaction_id = p_transaction_id
  LOOP
    -- Lock row untuk update (mencegah race condition)
    PERFORM id FROM products WHERE id = v_item.product_id FOR UPDATE;
    
    -- Tambahkan kembali stok
    UPDATE products 
    SET stock = stock + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;

  -- 3. Catat ke audit log
  INSERT INTO voided_logs (transaction_id, admin_id, total_amount, payment_method, items_snapshot, reason)
  VALUES (p_transaction_id, p_admin_id, v_tx.total_amount, v_tx.payment_method, COALESCE(v_items_snapshot, '[]'::jsonb), p_reason);

  -- 4. Hapus data item penjualannya dulu (supaya tidak kena foreign key constraint jika tidak cascade)
  DELETE FROM sales_items WHERE transaction_id = p_transaction_id;

  -- 5. Hapus data transaksi utamanya
  DELETE FROM sales_transactions WHERE id = p_transaction_id;

  RETURN jsonb_build_object('success', true, 'message', 'Transaksi berhasil dibatalkan dan dicatat ke audit log');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
