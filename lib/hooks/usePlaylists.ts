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
      console.log('Fetching songs for playlist:', playlistId)
      
      const { data, error } = await supabase
        .from('playlist_songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching playlist songs:', error)
        throw error
      }

      console.log('Raw playlist songs data:', data)

      if (!data || data.length === 0) {
        console.log('No songs found for playlist:', playlistId)
        return []
      }

      // Get profiles for all users who added songs
      const userIds = [...new Set(data.map(song => song.added_by))]
      console.log('Fetching profiles for user IDs:', userIds)

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds)

      if (profileError) {
        console.error('Error fetching profiles:', profileError)
        // Return songs without user data if profiles fail
        return data.map(song => ({
          ...song,
          user: null
        })) as PlaylistSong[]
      }

      console.log('Profiles data:', profiles)

      // Combine songs with user profiles
      const songsWithUsers = data.map(song => ({
        ...song,
        user: profiles?.find(profile => profile.id === song.added_by) || null
      }))

      console.log('Final songs with user data:', songsWithUsers)
      return songsWithUsers as PlaylistSong[]
    },
    enabled: !!playlistId,
  })

  // Add song
  const addSong = useMutation({
    mutationFn: async (newSong: { title: string; artist: string; url: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      console.log('Adding song:', { ...newSong, playlist_id: playlistId, added_by: user.id })

      const { data, error } = await supabase
        .from('playlist_songs')
        .insert({
          ...newSong,
          playlist_id: playlistId,
          added_by: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding song:', error)
        throw error
      }
      console.log('Song added successfully:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-songs', playlistId] })
      toast({ title: 'Song added to playlist!' })
    },
    onError: (error: any) => {
      console.error('Failed to add song:', error)
      toast({ 
        title: 'Error', 
        description: error?.message || 'Failed to add song', 
        variant: 'destructive' 
      })
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
