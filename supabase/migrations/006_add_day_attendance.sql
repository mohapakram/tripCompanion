-- Create day_attendance table to track which users are attending which days
CREATE TABLE day_attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(trip_id, user_id, day)
);

-- Create index
CREATE INDEX idx_day_attendance_trip_day ON day_attendance(trip_id, day);
CREATE INDEX idx_day_attendance_user ON day_attendance(user_id);

-- Enable RLS
ALTER TABLE day_attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trip members can view day attendance"
  ON day_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = day_attendance.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can join days"
  ON day_attendance FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = day_attendance.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave days"
  ON day_attendance FOR DELETE
  USING (user_id = auth.uid());
