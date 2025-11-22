'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useTripMember(tripId: string) {
  const supabase = createClient()

  const { data: memberData, isLoading } = useQuery({
    queryKey: ['trip-member', tripId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('trip_members')
        .select('role, user_id')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    },
  })

  return {
    role: memberData?.role || 'user',
    isAdmin: memberData?.role === 'admin',
    userId: memberData?.user_id,
    isLoading,
  }
}
