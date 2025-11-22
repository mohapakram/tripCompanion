-- Run this to fix the playlist creation policy
-- First, drop the old policy if it exists
DROP POLICY IF EXISTS "Trip admins can create playlists" ON playlists;

-- Create a simpler policy that checks admin role correctly
CREATE POLICY "Trip admins can create playlists"
  ON playlists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = playlists.trip_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- Also update the songs policy to be clearer
DROP POLICY IF EXISTS "Trip members can add songs to playlists" ON playlist_songs;

CREATE POLICY "Trip members can add songs to playlists"
  ON playlist_songs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists p
      JOIN trip_members tm ON tm.trip_id = p.trip_id
      WHERE p.id = playlist_songs.playlist_id
      AND tm.user_id = auth.uid()
    )
  );
