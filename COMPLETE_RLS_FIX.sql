-- Complete fix for RLS policy violations
-- Run this in your Supabase SQL Editor to fix all RLS issues

-- Part 1: Fix existing trips by adding creators as members
INSERT INTO trip_members (trip_id, user_id, role)
SELECT t.id, t.created_by, 'admin'
FROM trips t
LEFT JOIN trip_members tm ON tm.trip_id = t.id AND tm.user_id = t.created_by
WHERE tm.id IS NULL;

-- Part 2: Create trigger function to automatically add trip creators as members
CREATE OR REPLACE FUNCTION handle_new_trip()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the trip creator as an admin in trip_members
  INSERT INTO trip_members (trip_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.created_by, 'admin', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Part 3: Create trigger to automatically add trip creator as member
DROP TRIGGER IF EXISTS on_trip_created ON trips;
CREATE TRIGGER on_trip_created
  AFTER INSERT ON trips
  FOR EACH ROW EXECUTE PROCEDURE handle_new_trip();

-- Part 4: Verify the fix worked
-- This query should return 0 rows if all trip creators are now members
SELECT 
  t.id as trip_id, 
  t.name, 
  t.created_by as creator_user_id,
  'Missing from trip_members' as issue
FROM trips t
LEFT JOIN trip_members tm ON tm.trip_id = t.id AND tm.user_id = t.created_by
WHERE tm.id IS NULL;

-- If the above query returns 0 rows, the fix is successful!