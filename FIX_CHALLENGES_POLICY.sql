-- Run this in your Supabase SQL Editor to allow all trip members to create challenges

-- Drop the old policy that only allowed admins
DROP POLICY IF EXISTS "Trip admins can create challenges" ON challenges;

-- Create new policy that allows all trip members to create challenges
CREATE POLICY "Trip members can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = challenges.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );
