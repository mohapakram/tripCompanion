export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          role: string
          joined_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          trip_id: string
          day: number
          title: string
          time: string
          description: string | null
          location_url: string | null
          finalized: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          day: number
          title: string
          time: string
          description?: string | null
          location_url?: string | null
          finalized?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          day?: number
          title?: string
          time?: string
          description?: string | null
          location_url?: string | null
          finalized?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_votes: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          trip_id: string
          text: string
          points: number
          category: string
          location_required: boolean
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          text: string
          points?: number
          category: string
          location_required?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          text?: string
          points?: number
          category?: string
          location_required?: boolean
          created_at?: string
        }
      }
      challenge_submissions: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          media_id: string | null
          approved: boolean
          points_awarded: number
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          media_id?: string | null
          approved?: boolean
          points_awarded?: number
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          media_id?: string | null
          approved?: boolean
          points_awarded?: number
          created_at?: string
        }
      }
      media: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          activity_id: string | null
          day: number | null
          url: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          activity_id?: string | null
          day?: number | null
          url: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          activity_id?: string | null
          day?: number | null
          url?: string
          type?: string
          created_at?: string
        }
      }
      leaderboard_cache: {
        Row: {
          trip_id: string
          user_id: string
          total_points: number
          updated_at: string
        }
        Insert: {
          trip_id: string
          user_id: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          trip_id?: string
          user_id?: string
          total_points?: number
          updated_at?: string
        }
      }
      invite_codes: {
        Row: {
          id: string
          trip_id: string
          code: string
          created_by: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          code: string
          created_by: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          code?: string
          created_by?: string
          expires_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
