-- Fix trips RLS policy to allow creating trips
-- Run this in Supabase SQL Editor

-- First, let's check and fix the trips INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create trips" ON trips;

CREATE POLICY "Authenticated users can create trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Also ensure the SELECT policy doesn't block new trips
DROP POLICY IF EXISTS "Trip members can view their trips" ON trips;

CREATE POLICY "Trip members can view their trips"
  ON trips FOR SELECT
  TO authenticated
  USING (
    -- User is the creator
    created_by = auth.uid()
    OR
    -- User is a member
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trips.id
      AND trip_members.user_id = auth.uid()
    )
  );

-- Make sure the trigger function has proper privileges
DROP TRIGGER IF EXISTS on_trip_created ON trips;
DROP FUNCTION IF EXISTS add_creator_as_member();

CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO trip_members (trip_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_trip_created
  AFTER INSERT ON trips
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_member();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
