-- File: setup_global_audit.sql
-- Description: Create global_audit_logs table and triggers to track all changes

-- 1. Create the audit table
CREATE TABLE IF NOT EXISTS global_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name VARCHAR(50) NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for global_audit_logs
ALTER TABLE global_audit_logs ENABLE ROW LEVEL SECURITY;

-- Owner can view all audit logs
DROP POLICY IF EXISTS "Owner can view audit logs" ON global_audit_logs;
CREATE POLICY "Owner can view audit logs" ON global_audit_logs
    FOR SELECT USING (get_auth_role() = 'Owner');

-- Triggers bypass RLS when executed as SECURITY DEFINER, but we still need to allow system inserts if needed, 
-- or we can just let the SECURITY DEFINER trigger insert them regardless of RLS policies.
-- Wait, the trigger function runs as the table owner if SECURITY DEFINER is used.

-- 2. Create the Trigger Function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Try to get the user ID from the active Supabase Auth JWT
  v_admin_id := auth.uid();

  -- Fallback for Server Actions using Service Role Key (auth.uid is null)
  -- If the table has a last_modified_by column, extract admin from there
  IF v_admin_id IS NULL AND TG_OP IN ('INSERT', 'UPDATE') THEN
    IF (to_jsonb(NEW)) ? 'last_modified_by' AND (to_jsonb(NEW) ->> 'last_modified_by') IS NOT NULL THEN
      v_admin_id := (to_jsonb(NEW) ->> 'last_modified_by')::uuid;
    ELSIF (to_jsonb(NEW)) ? 'created_by' AND (to_jsonb(NEW) ->> 'created_by') IS NOT NULL THEN
      v_admin_id := (to_jsonb(NEW) ->> 'created_by')::uuid;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO global_audit_logs(admin_id, action_type, table_name, record_id, new_data)
    VALUES (v_admin_id, TG_OP, TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if something actually changed (optional, but good for saving space)
    IF to_jsonb(OLD) IS DISTINCT FROM to_jsonb(NEW) THEN
        INSERT INTO global_audit_logs(admin_id, action_type, table_name, record_id, old_data, new_data)
        VALUES (v_admin_id, TG_OP, TG_TABLE_NAME, NEW.id::text, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO global_audit_logs(admin_id, action_type, table_name, record_id, old_data)
    VALUES (v_admin_id, TG_OP, TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach triggers to important tables
-- Products
DROP TRIGGER IF EXISTS audit_products_trigger ON products;
CREATE TRIGGER audit_products_trigger
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Expenses
DROP TRIGGER IF EXISTS audit_expenses_trigger ON expenses;
CREATE TRIGGER audit_expenses_trigger
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Members
DROP TRIGGER IF EXISTS audit_members_trigger ON members;
CREATE TRIGGER audit_members_trigger
AFTER INSERT OR UPDATE OR DELETE ON members
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Subscriptions
DROP TRIGGER IF EXISTS audit_subscriptions_trigger ON subscriptions;
CREATE TRIGGER audit_subscriptions_trigger
AFTER INSERT OR UPDATE OR DELETE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Users: REMOVED - This trigger conflicts with Supabase Auth's internal
-- user creation process and causes "Database error creating new user".
-- User changes are already tracked via the members and subscriptions triggers.
-- DROP TRIGGER IF EXISTS audit_users_trigger ON users;
