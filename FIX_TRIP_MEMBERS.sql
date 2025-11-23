-- Fix missing trip creators as members
-- This solves issues with:
-- 1. Media not loading (RLS prevents non-members from viewing media)
-- 2. Activities joining not working (RLS prevents non-members from voting)
-- 3. Any other trip-related functionality that requires membership

-- Add trip creators as admin members if they're missing
INSERT INTO trip_members (trip_id, user_id, role)
SELECT t.id, t.created_by, 'admin'
FROM trips t
LEFT JOIN trip_members tm ON tm.trip_id = t.id AND tm.user_id = t.created_by
WHERE tm.id IS NULL;

-- Verify the fix worked
-- This query should return 0 rows if all trip creators are now members
SELECT t.id as trip_id, t.name, t.created_by as creator_user_id
FROM trips t
LEFT JOIN trip_members tm ON tm.trip_id = t.id AND tm.user_id = t.created_by
WHERE tm.id IS NULL;