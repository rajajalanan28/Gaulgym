-- Fix: Add unique constraint on members.user_id so the DB trigger works properly
-- Run this in Supabase SQL Editor

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_user_id_key'
  ) THEN
    ALTER TABLE public.members ADD CONSTRAINT members_user_id_key UNIQUE (user_id);
  END IF;
END $$;
