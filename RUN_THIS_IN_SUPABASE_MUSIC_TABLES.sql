-- Run this in your Supabase SQL Editor to add the Music feature
-- This creates the playlists and playlist_songs tables with proper permissions

-- Create playlists table
CREATE TABLE playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create playlist_songs table
CREATE TABLE playlist_songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  url TEXT NOT NULL,
  added_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  played BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_playlists_trip_id ON playlists(trip_id);
CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_added_by ON playlist_songs(added_by);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Playlists policies
CREATE POLICY "Trip members can view playlists"
  ON playlists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = playlists.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip admins can create playlists"
  ON playlists FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = playlists.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'admin'
    )
  );

CREATE POLICY "Playlist creators can update their playlists"
  ON playlists FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Playlist creators can delete their playlists"
  ON playlists FOR DELETE
  USING (created_by = auth.uid());

-- Playlist songs policies
CREATE POLICY "Trip members can view playlist songs"
  ON playlist_songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists p
      JOIN trip_members tm ON tm.trip_id = p.trip_id
      WHERE p.id = playlist_songs.playlist_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can add songs to playlists"
  ON playlist_songs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists p
      JOIN trip_members tm ON tm.trip_id = p.trip_id
      WHERE p.id = playlist_songs.playlist_id
      AND tm.user_id = auth.uid()
    ) AND added_by = auth.uid()
  );

CREATE POLICY "Trip admins can mark songs as played"
  ON playlist_songs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM playlists p
      JOIN trip_members tm ON tm.trip_id = p.trip_id
      WHERE p.id = playlist_songs.playlist_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

CREATE POLICY "Song creators can delete their songs"
  ON playlist_songs FOR DELETE
  USING (added_by = auth.uid());
