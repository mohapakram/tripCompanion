'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Media } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function useMedia(tripId: string, day?: number) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: media, isLoading, error } = useQuery({
    queryKey: ['media', tripId, day],
    queryFn: async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error('User not authenticated')
        }
        
        // First get media without join
        let mediaQuery = supabase
          .from('media')
          .select('*')
          .eq('trip_id', tripId)
          .order('created_at', { ascending: false })

        if (day !== undefined) {
          mediaQuery = mediaQuery.eq('day', day)
        }

        const { data: mediaData, error: mediaError } = await mediaQuery

        if (mediaError) {
          throw mediaError
        }
        
        // If we have media, get the user profiles separately
        if (mediaData && mediaData.length > 0) {
          const userIds = [...new Set(mediaData.map(m => m.user_id))]
          
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds)
          
          if (profileError) {
            console.error('Error fetching profiles:', profileError)
            // Continue without profiles if there's an error
          }
          
          // Combine media with profiles
          const mediaWithProfiles = mediaData.map(media => ({
            ...media,
            user: profiles?.find(p => p.id === media.user_id) || {
              id: media.user_id,
              full_name: 'Unknown User',
              avatar_url: null
            }
          }))
          
          return mediaWithProfiles
        }
        
        return mediaData || []
      } catch (err) {
        console.error('Media fetch error:', err)
        throw err
      }
    },
  })

  const uploadMedia = useMutation({
    mutationFn: async (files: { file: File; day?: number; activityId?: string }[]) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const results = []

      for (const { file, day, activityId } of files) {
        try {
          // Upload file to storage
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

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
          results.push(data)
        } catch (error) {
          console.error('Error uploading file:', file.name, error)
          throw error
        }
      }

      return results
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media', tripId] })
      const count = Array.isArray(data) ? data.length : 1
      toast({ 
        title: `${count} file${count > 1 ? 's' : ''} uploaded successfully!`,
        description: count > 1 ? 'All files have been added to your media vault.' : 'File has been added to your media vault.'
      })
    },
    onError: (error: any) => {
      console.error('Upload failed:', error)
      toast({ 
        title: 'Upload failed', 
        description: error?.message || 'Failed to upload media files', 
        variant: 'destructive' 
      })
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
    error,
    uploadMedia,
    deleteMedia,
  }
}
