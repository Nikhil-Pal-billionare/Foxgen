-- Add plan_id and credits columns to waitlist table
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS plan_id TEXT,
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
