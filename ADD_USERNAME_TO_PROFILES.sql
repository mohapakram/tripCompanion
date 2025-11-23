-- Add username field to profiles table if needed
-- Run this in Supabase SQL Editor if username is required elsewhere

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);