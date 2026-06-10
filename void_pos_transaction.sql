-- File: void_pos_transaction.sql
-- Description: RPC to void a POS transaction, restore product stock, and delete the transaction records.

CREATE OR REPLACE FUNCTION void_pos_transaction(
  p_transaction_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- 1. Pastikan transaksi ini ada
  IF NOT EXISTS (SELECT 1 FROM sales_transactions WHERE id = p_transaction_id) THEN
    RAISE EXCEPTION 'Transaksi tidak ditemukan';
  END IF;

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

  -- 3. Hapus data item penjualannya dulu (supaya tidak kena foreign key constraint jika tidak cascade)
  DELETE FROM sales_items WHERE transaction_id = p_transaction_id;

  -- 4. Hapus data transaksi utamanya
  DELETE FROM sales_transactions WHERE id = p_transaction_id;

  RETURN jsonb_build_object('success', true, 'message', 'Transaksi berhasil dibatalkan dan stok telah dikembalikan');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
