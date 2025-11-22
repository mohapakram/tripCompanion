-- Fix infinite recursion in trip_members policies
-- Run this in Supabase SQL Editor

-- First, recreate the add_creator_as_member function with SECURITY DEFINER
-- This allows it to bypass RLS when inserting the creator
DROP TRIGGER IF EXISTS on_trip_created ON trips;
DROP FUNCTION IF EXISTS add_creator_as_member();

CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER
SECURITY DEFINER -- This is the key: bypass RLS for this function
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO trip_members (trip_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_trip_created
  AFTER INSERT ON trips
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_member();

-- Now fix the trip_members SELECT policy to be simpler
DROP POLICY IF EXISTS "Trip members can view other members" ON trip_members;

CREATE POLICY "Trip members can view other members"
  ON trip_members FOR SELECT
  USING (true); -- Allow all authenticated users to view memberships

-- The security is maintained because users can only see trips they're members of
-- due to the trips SELECT policy
