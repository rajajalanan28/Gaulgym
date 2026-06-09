-- File: setup_pos_rpc.sql
-- Description: Atomic transaction for POS to prevent race conditions and negative stock
-- IMPORTANT: Run this file in your Supabase SQL Editor.

CREATE OR REPLACE FUNCTION process_pos_transaction(
  p_admin_id UUID,
  p_total_amount NUMERIC,
  p_payment_method TEXT,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_transaction_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
  v_price NUMERIC;
  v_current_stock INT;
BEGIN
  -- 1. Insert transaction
  INSERT INTO sales_transactions (admin_id, total_amount, payment_method)
  VALUES (p_admin_id, p_total_amount, p_payment_method)
  RETURNING id INTO v_transaction_id;

  -- 2. Loop through items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;
    v_price := (v_item->>'price')::NUMERIC;

    -- Lock the row for update to prevent race conditions
    SELECT stock INTO v_current_stock
    FROM products
    WHERE id = v_product_id
    FOR UPDATE;

    IF v_current_stock < v_quantity THEN
      RAISE EXCEPTION 'Stock insufficient for product %', v_product_id;
    END IF;

    -- Deduct stock
    UPDATE products
    SET stock = stock - v_quantity
    WHERE id = v_product_id;

    -- Record item sale
    INSERT INTO sales_items (transaction_id, product_id, quantity, price)
    VALUES (v_transaction_id, v_product_id, v_quantity, v_price);
  END LOOP;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
