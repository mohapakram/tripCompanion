'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { DayAttendance } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function useDayAttendance(tripId: string, day?: number) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch attendance for a specific day or all days
  const { data: attendance, isLoading } = useQuery({
    queryKey: day ? ['day-attendance', tripId, day] : ['day-attendance', tripId],
    queryFn: async () => {
      let query = supabase
        .from('day_attendance')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('trip_id', tripId)

      if (day !== undefined) {
        query = query.eq('day', day)
      }

      const { data, error } = await query

      if (error) throw error
      return data as DayAttendance[]
    },
  })

  // Check if current user is attending a specific day
  const { data: isAttending } = useQuery({
    queryKey: ['user-day-attendance', tripId, day],
    queryFn: async () => {
      if (!day) return false

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('day_attendance')
        .select('id')
        .eq('trip_id', tripId)
        .eq('day', day)
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    },
    enabled: day !== undefined,
  })

  // Join a day
  const joinDay = useMutation({
    mutationFn: async (dayNumber: number) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('day_attendance')
        .insert({
          trip_id: tripId,
          user_id: user.id,
          day: dayNumber,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-attendance', tripId] })
      queryClient.invalidateQueries({ queryKey: ['user-day-attendance', tripId] })
      toast({ title: 'Joined day successfully!' })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to join day',
        variant: 'destructive'
      })
    },
  })

  // Leave a day
  const leaveDay = useMutation({
    mutationFn: async (dayNumber: number) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('day_attendance')
        .delete()
        .eq('trip_id', tripId)
        .eq('day', dayNumber)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-attendance', tripId] })
      queryClient.invalidateQueries({ queryKey: ['user-day-attendance', tripId] })
      toast({ title: 'Left day' })
    },
  })

  return {
    attendance,
    isAttending,
    isLoading,
    joinDay,
    leaveDay,
  }
}
