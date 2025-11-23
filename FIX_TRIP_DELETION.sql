-- Fix trip deletion issue by adding missing DELETE policy
-- This allows trip creators (admins) to delete their trips

CREATE POLICY "Trip admins can delete trips"
  ON trips FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trips.id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'admin'
    )
  );