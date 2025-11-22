-- Seed data for challenges
-- This provides a fun set of challenges for trips

-- Note: Replace 'YOUR_TRIP_ID_HERE' with an actual trip ID when using this seed

-- Photo Challenges
INSERT INTO challenges (trip_id, text, points, category, location_required) VALUES
  ('YOUR_TRIP_ID_HERE', 'Take a selfie with a stranger', 15, 'photo', false),
  ('YOUR_TRIP_ID_HERE', 'Capture a beautiful sunrise or sunset', 10, 'photo', false),
  ('YOUR_TRIP_ID_HERE', 'Photo with local street food', 10, 'photo', false),
  ('YOUR_TRIP_ID_HERE', 'Jump shot with the whole group', 15, 'photo', false),
  ('YOUR_TRIP_ID_HERE', 'Picture with a local landmark', 10, 'photo', true),
  ('YOUR_TRIP_ID_HERE', 'Recreate a famous movie scene', 20, 'photo', false),
  ('YOUR_TRIP_ID_HERE', 'Photo making a funny face', 5, 'photo', false),
  ('YOUR_TRIP_ID_HERE', 'Picture with an animal', 10, 'photo', false),
  ('YOUR_TRIP_ID_HERE', 'Mirror selfie at a unique location', 10, 'photo', false),
  ('YOUR_TRIP_ID_HERE', 'Photo of the weirdest thing you find', 15, 'photo', false);

-- Dare Challenges
INSERT INTO challenges (trip_id, text, points, category, location_required) VALUES
  ('YOUR_TRIP_ID_HERE', 'Speak in an accent for 10 minutes', 15, 'dare', false),
  ('YOUR_TRIP_ID_HERE', 'Dance in a public place', 20, 'dare', false),
  ('YOUR_TRIP_ID_HERE', 'Eat something you''ve never tried before', 15, 'dare', false),
  ('YOUR_TRIP_ID_HERE', 'Give someone a genuine compliment', 10, 'dare', false),
  ('YOUR_TRIP_ID_HERE', 'Sing karaoke (even badly)', 25, 'dare', false),
  ('YOUR_TRIP_ID_HERE', 'Try a local phrase in the native language', 10, 'dare', false),
  ('YOUR_TRIP_ID_HERE', 'Wear your shirt backwards for 2 hours', 15, 'dare', false),
  ('YOUR_TRIP_ID_HERE', 'Do 20 pushups in a public spot', 15, 'dare', false),
  ('YOUR_TRIP_ID_HERE', 'Make a new friend from another country', 20, 'dare', false),
  ('YOUR_TRIP_ID_HERE', 'Go an entire meal without using your phone', 10, 'dare', false);

-- Scavenger Hunt Challenges
INSERT INTO challenges (trip_id, text, points, category, location_required) VALUES
  ('YOUR_TRIP_ID_HERE', 'Find something red, round, and edible', 10, 'scavenger', false),
  ('YOUR_TRIP_ID_HERE', 'Collect a business card from a local shop', 10, 'scavenger', false),
  ('YOUR_TRIP_ID_HERE', 'Find a coin from this year', 5, 'scavenger', false),
  ('YOUR_TRIP_ID_HERE', 'Get a map or brochure of the city', 5, 'scavenger', false),
  ('YOUR_TRIP_ID_HERE', 'Find something with the trip destination name on it', 15, 'scavenger', true),
  ('YOUR_TRIP_ID_HERE', 'Collect a receipt from the highest altitude', 15, 'scavenger', false),
  ('YOUR_TRIP_ID_HERE', 'Find a postcard and mail it', 20, 'scavenger', false),
  ('YOUR_TRIP_ID_HERE', 'Get a recommendation from a local', 15, 'scavenger', false),
  ('YOUR_TRIP_ID_HERE', 'Find a leaf from a unique tree', 10, 'scavenger', false),
  ('YOUR_TRIP_ID_HERE', 'Locate the oldest building nearby', 20, 'scavenger', true);
