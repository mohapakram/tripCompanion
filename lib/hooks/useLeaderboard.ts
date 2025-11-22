'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { LeaderboardEntry } from '@/types'

export function useLeaderboard(tripId: string) {
  const supabase = createClient()

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_cache')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('trip_id', tripId)
        .order('total_points', { ascending: false })

      if (error) throw error
      return data as LeaderboardEntry[]
    },
  })

  return {
    leaderboard,
    isLoading,
  }
}
