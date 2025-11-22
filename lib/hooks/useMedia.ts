'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Media } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function useMedia(tripId: string, day?: number) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: media, isLoading } = useQuery({
    queryKey: ['media', tripId, day],
    queryFn: async () => {
      let query = supabase
        .from('media')
        .select(`
          *,
          user:profiles(*),
          activity:activities(*)
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })

      if (day !== undefined) {
        query = query.eq('day', day)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Media[]
    },
  })

  const uploadMedia = useMutation({
    mutationFn: async ({
      file,
      day,
      activityId,
    }: {
      file: File
      day?: number
      activityId?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('trip-media')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trip-media')
        .getPublicUrl(fileName)

      // Create media record
      const { data, error } = await supabase
        .from('media')
        .insert({
          trip_id: tripId,
          user_id: user.id,
          activity_id: activityId,
          day,
          url: publicUrl,
          type: file.type.startsWith('video/') ? 'video' : 'image',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', tripId] })
      toast({ title: 'Media uploaded successfully!' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to upload media', variant: 'destructive' })
    },
  })

  const deleteMedia = useMutation({
    mutationFn: async (mediaId: string) => {
      const mediaItem = media?.find((m) => m.id === mediaId)
      if (!mediaItem) throw new Error('Media not found')

      // Delete from storage
      const fileName = mediaItem.url.split('/').slice(-2).join('/')
      await supabase.storage.from('trip-media').remove([fileName])

      // Delete record
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', tripId] })
      toast({ title: 'Media deleted' })
    },
  })

  return {
    media,
    isLoading,
    uploadMedia,
    deleteMedia,
  }
}
