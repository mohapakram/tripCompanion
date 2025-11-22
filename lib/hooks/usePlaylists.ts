'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Playlist, PlaylistSong } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function usePlaylists(tripId: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch playlists
  const { data: playlists, isLoading } = useQuery({
    queryKey: ['playlists', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Playlist[]
    },
  })

  // Create playlist
  const createPlaylist = useMutation({
    mutationFn: async (newPlaylist: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('playlists')
        .insert({
          ...newPlaylist,
          trip_id: tripId,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Playlist creation error:', error)
        throw error
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists', tripId] })
      toast({ title: 'Playlist created successfully!' })
    },
    onError: (error: any) => {
      console.error('Playlist creation failed:', error)
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create playlist',
        variant: 'destructive'
      })
    },
  })

  // Delete playlist
  const deletePlaylist = useMutation({
    mutationFn: async (playlistId: string) => {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists', tripId] })
      toast({ title: 'Playlist deleted' })
    },
  })

  return {
    playlists,
    isLoading,
    createPlaylist,
    deletePlaylist,
  }
}

export function usePlaylistSongs(playlistId: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch songs
  const { data: songs, isLoading } = useQuery({
    queryKey: ['playlist-songs', playlistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlist_songs')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as PlaylistSong[]
    },
    enabled: !!playlistId,
  })

  // Add song
  const addSong = useMutation({
    mutationFn: async (newSong: { title: string; artist: string; url: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('playlist_songs')
        .insert({
          ...newSong,
          playlist_id: playlistId,
          added_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-songs', playlistId] })
      toast({ title: 'Song added to playlist!' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add song', variant: 'destructive' })
    },
  })

  // Toggle played status
  const togglePlayed = useMutation({
    mutationFn: async ({ songId, played }: { songId: string; played: boolean }) => {
      const { error } = await supabase
        .from('playlist_songs')
        .update({ played: !played })
        .eq('id', songId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-songs', playlistId] })
    },
  })

  // Delete song
  const deleteSong = useMutation({
    mutationFn: async (songId: string) => {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('id', songId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-songs', playlistId] })
      toast({ title: 'Song removed' })
    },
  })

  return {
    songs,
    isLoading,
    addSong,
    togglePlayed,
    deleteSong,
  }
}
