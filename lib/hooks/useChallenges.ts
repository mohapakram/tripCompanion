'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Challenge, ChallengeSubmission } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function useChallenges(tripId: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('trip_id', tripId)
        .order('category', { ascending: true })

      if (error) throw error
      return data as Challenge[]
    },
  })

  const { data: submissions } = useQuery({
    queryKey: ['submissions', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select(`
          *,
          challenge:challenges(*),
          user:profiles(*),
          media(*)
        `)
        .eq('challenge.trip_id', tripId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ChallengeSubmission[]
    },
  })

  const submitChallenge = useMutation({
    mutationFn: async ({ challengeId, mediaId }: { challengeId: string; mediaId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: challenge } = await supabase
        .from('challenges')
        .select('points')
        .eq('id', challengeId)
        .single()

      const { data, error } = await supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          media_id: mediaId,
          approved: false,
          points_awarded: challenge?.points || 0,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', tripId] })
      toast({ title: 'Challenge submitted! Waiting for approval.' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit challenge', variant: 'destructive' })
    },
  })

  const approveSubmission = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('challenge_submissions')
        .update({ approved: true })
        .eq('id', submissionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', tripId] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard', tripId] })
      toast({ title: 'Submission approved!' })
    },
  })

  const createChallenge = useMutation({
    mutationFn: async (newChallenge: Partial<Challenge>) => {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          ...newChallenge,
          trip_id: tripId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', tripId] })
      toast({ title: 'Challenge created successfully!' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create challenge', variant: 'destructive' })
    },
  })

  return {
    challenges,
    submissions,
    isLoading,
    submitChallenge,
    approveSubmission,
    createChallenge,
  }
}
