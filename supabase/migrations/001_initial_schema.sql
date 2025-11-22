-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trips table
CREATE TABLE trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trip_members table
CREATE TABLE trip_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(trip_id, user_id)
);

-- Create invite_codes table
CREATE TABLE invite_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create activities table
CREATE TABLE activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  day INTEGER NOT NULL CHECK (day > 0),
  title TEXT NOT NULL,
  time TIME NOT NULL,
  description TEXT,
  location_url TEXT,
  finalized BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create activity_votes table
CREATE TABLE activity_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(activity_id, user_id)
);

-- Create challenges table
CREATE TABLE challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  category TEXT NOT NULL CHECK (category IN ('photo', 'dare', 'scavenger')),
  location_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create media table
CREATE TABLE media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  day INTEGER,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create challenge_submissions table
CREATE TABLE challenge_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  approved BOOLEAN DEFAULT FALSE,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(challenge_id, user_id)
);

-- Create leaderboard_cache table (materialized view for performance)
CREATE TABLE leaderboard_cache (
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (trip_id, user_id)
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user_id ON trip_members(user_id);
CREATE INDEX idx_activities_trip_id ON activities(trip_id);
CREATE INDEX idx_activities_day ON activities(trip_id, day);
CREATE INDEX idx_activity_votes_activity_id ON activity_votes(activity_id);
CREATE INDEX idx_challenges_trip_id ON challenges(trip_id);
CREATE INDEX idx_challenge_submissions_challenge_id ON challenge_submissions(challenge_id);
CREATE INDEX idx_challenge_submissions_user_id ON challenge_submissions(user_id);
CREATE INDEX idx_media_trip_id ON media(trip_id);
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_activity_id ON media(activity_id);
CREATE INDEX idx_leaderboard_trip_id ON leaderboard_cache(trip_id);

-- =====================
-- FUNCTIONS
-- =====================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update leaderboard cache
CREATE OR REPLACE FUNCTION update_leaderboard_cache()
RETURNS TRIGGER AS $$
DECLARE
  v_trip_id UUID;
  v_user_id UUID;
  v_total_points INTEGER;
BEGIN
  -- Get trip_id and user_id from the submission
  SELECT c.trip_id, NEW.user_id INTO v_trip_id, v_user_id
  FROM challenges c
  WHERE c.id = NEW.challenge_id;

  -- Calculate total points for this user in this trip
  SELECT COALESCE(SUM(cs.points_awarded), 0) INTO v_total_points
  FROM challenge_submissions cs
  JOIN challenges c ON cs.challenge_id = c.id
  WHERE c.trip_id = v_trip_id AND cs.user_id = v_user_id AND cs.approved = TRUE;

  -- Update or insert into leaderboard_cache
  INSERT INTO leaderboard_cache (trip_id, user_id, total_points, updated_at)
  VALUES (v_trip_id, v_user_id, v_total_points, NOW())
  ON CONFLICT (trip_id, user_id)
  DO UPDATE SET total_points = v_total_points, updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboard when submission is approved
CREATE TRIGGER on_challenge_submission_approved
  AFTER INSERT OR UPDATE ON challenge_submissions
  FOR EACH ROW
  WHEN (NEW.approved = TRUE)
  EXECUTE FUNCTION update_leaderboard_cache();

-- Function to auto-add trip creator as admin member
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trip_members (trip_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add creator as member
CREATE TRIGGER on_trip_created
  AFTER INSERT ON trips
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_member();

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trips policies
CREATE POLICY "Trip members can view their trips"
  ON trips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trips.id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Trip admins can update trips"
  ON trips FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trips.id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'admin'
    )
  );

-- Trip members policies
CREATE POLICY "Trip members can view other members"
  ON trip_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = trip_members.trip_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join trips with invite"
  ON trip_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trip admins can manage members"
  ON trip_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = trip_members.trip_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- Invite codes policies
CREATE POLICY "Anyone can view valid invite codes"
  ON invite_codes FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

CREATE POLICY "Trip admins can create invite codes"
  ON invite_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = invite_codes.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'admin'
    )
  );

-- Activities policies
CREATE POLICY "Trip members can view activities"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = activities.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create activities"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = activities.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Activity creators and admins can update activities"
  ON activities FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = activities.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'admin'
    )
  );

CREATE POLICY "Activity creators and admins can delete activities"
  ON activities FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = activities.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'admin'
    )
  );

-- Activity votes policies
CREATE POLICY "Trip members can view votes"
  ON activity_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      JOIN trip_members tm ON tm.trip_id = a.trip_id
      WHERE a.id = activity_votes.activity_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can vote on activities"
  ON activity_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM activities a
      JOIN trip_members tm ON tm.trip_id = a.trip_id
      WHERE a.id = activity_votes.activity_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own votes"
  ON activity_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Trip members can view challenges"
  ON challenges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = challenges.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip admins can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = challenges.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'admin'
    )
  );

-- Challenge submissions policies
CREATE POLICY "Trip members can view submissions"
  ON challenge_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM challenges c
      JOIN trip_members tm ON tm.trip_id = c.trip_id
      WHERE c.id = challenge_submissions.challenge_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can submit challenges"
  ON challenge_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM challenges c
      JOIN trip_members tm ON tm.trip_id = c.trip_id
      WHERE c.id = challenge_submissions.challenge_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip admins can approve submissions"
  ON challenge_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM challenges c
      JOIN trip_members tm ON tm.trip_id = c.trip_id
      WHERE c.id = challenge_submissions.challenge_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- Media policies
CREATE POLICY "Trip members can view media"
  ON media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = media.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can upload media"
  ON media FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = media.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Media owners can delete their media"
  ON media FOR DELETE
  USING (auth.uid() = user_id);

-- Leaderboard cache policies
CREATE POLICY "Trip members can view leaderboard"
  ON leaderboard_cache FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = leaderboard_cache.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

-- =====================
-- STORAGE BUCKETS
-- =====================

-- Create storage bucket for media (run this in Supabase dashboard or via SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-media', 'trip-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Trip members can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trip-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view trip media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trip-media');

CREATE POLICY "Users can delete their own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'trip-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
