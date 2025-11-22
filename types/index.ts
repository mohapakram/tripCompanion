export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export interface Trip {
  id: string
  name: string
  start_date: string
  end_date: string
  created_by: string
  created_at: string
}

export interface TripMember {
  id: string
  trip_id: string
  user_id: string
  role: 'admin' | 'user'
  joined_at: string
  user?: User
}

export interface Activity {
  id: string
  trip_id: string
  day: number
  title: string
  time: string
  description?: string
  location_url?: string
  finalized: boolean
  created_by: string
  created_at: string
  votes_count?: number
  user_voted?: boolean
  voters?: Array<{
    id: string
    user_id: string
    user?: User
  }>
}

export interface ActivityVote {
  id: string
  activity_id: string
  user_id: string
  created_at: string
}

export type ChallengeCategory = 'photo' | 'dare' | 'scavenger'

export interface Challenge {
  id: string
  trip_id: string
  text: string
  points: number
  category: ChallengeCategory
  location_required: boolean
  created_at: string
}

export interface ChallengeSubmission {
  id: string
  challenge_id: string
  user_id: string
  media_id?: string
  approved: boolean
  points_awarded: number
  created_at: string
  challenge?: Challenge
  user?: User
  media?: Media
}

export interface Media {
  id: string
  trip_id: string
  user_id: string
  activity_id?: string
  day?: number
  url: string
  type: 'image' | 'video'
  created_at: string
  user?: User
  activity?: Activity
}

export interface LeaderboardEntry {
  trip_id: string
  user_id: string
  total_points: number
  user?: User
}

export interface InviteCode {
  id: string
  trip_id: string
  code: string
  created_by: string
  expires_at?: string
  created_at: string
}

export interface Playlist {
  id: string
  trip_id: string
  name: string
  description?: string
  created_by: string
  created_at: string
}

export interface PlaylistSong {
  id: string
  playlist_id: string
  title: string
  artist: string
  url: string
  added_by: string
  played: boolean
  created_at: string
  user?: User
}

export interface DayAttendance {
  id: string
  trip_id: string
  user_id: string
  day: number
  created_at: string
  user?: User
}
