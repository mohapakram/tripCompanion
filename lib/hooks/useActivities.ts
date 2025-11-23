'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Activity } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'

export function useActivities(tripId: string, day?: number) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch activities
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activities', tripId, day],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select(`
          *,
          activity_votes(count)
        `)
        .eq('trip_id', tripId)
        .order('time', { ascending: true })

      if (day !== undefined) {
        query = query.eq('day', day)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Check if user has voted and get all voters
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        throw authError
      }

      const enrichedActivities = await Promise.all(
        (data || []).map(async (activity) => {
          // Check if current user voted
          const { data: userVote, error: voteError } = await supabase
            .from('activity_votes')
            .select('id')
            .eq('activity_id', activity.id)
            .eq('user_id', user?.id || '')
            .single()

          if (voteError && voteError.code !== 'PGRST116') {
            console.error('Error checking user vote:', voteError)
          }

          // Get all voters with their profiles
          const { data: voters, error: votersError } = await supabase
            .from('activity_votes')
            .select(`
              id,
              user_id,
              user:profiles(*)
            `)
            .eq('activity_id', activity.id)

          if (votersError) {
            console.error('Error fetching voters:', votersError)
          }

          const result = {
            ...activity,
            votes_count: activity.activity_votes[0]?.count || 0,
            user_voted: !!userVote,
            voters: voters || [],
          }

          return result
        })
      )

      return enrichedActivities as Activity[]
    },
  })

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`activities-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activities', tripId] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_votes',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activities', tripId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tripId, supabase, queryClient])

  // Create activity mutation
  const createActivity = useMutation({
    mutationFn: async (newActivity: Partial<Activity>) => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('activities')
        .insert({
          ...newActivity,
          trip_id: tripId,
          created_by: user?.id || '',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] })
      toast({ title: 'Activity created successfully!' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create activity', variant: 'destructive' })
    },
  })

  // Vote mutation
  const toggleVote = useMutation({
    mutationFn: async ({ activityId, userVoted }: { activityId: string; userVoted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (userVoted) {
        const { error } = await supabase
          .from('activity_votes')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', user.id)

        if (error) {
          throw error
        }
      } else {
        const { error } = await supabase
          .from('activity_votes')
          .insert({
            activity_id: activityId,
            user_id: user.id,
          })

        if (error) {
          throw error
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] })
    },
    onError: (error) => {
      console.error('Vote mutation failed:', error)
      toast({ 
        title: 'Error', 
        description: `Failed to update vote: ${error.message}`, 
        variant: 'destructive' 
      })
    },
  })

  // Delete activity mutation
  const deleteActivity = useMutation({
    mutationFn: async (activityId: string) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] })
      toast({ title: 'Activity deleted' })
    },
  })

  return {
    activities,
    isLoading,
    error,
    createActivity,
    toggleVote,
    deleteActivity,
  }
}
