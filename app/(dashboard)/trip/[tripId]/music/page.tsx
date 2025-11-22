'use client'

import { use, useState } from 'react'
import { usePlaylists, usePlaylistSongs } from '@/lib/hooks/usePlaylists'
import { useTripMember } from '@/lib/hooks/useTripMember'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Music, Trash2, ExternalLink } from 'lucide-react'

export default function MusicPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const { user } = useAuth()
  const { isAdmin } = useTripMember(tripId)
  const { playlists, isLoading, createPlaylist, deletePlaylist } = usePlaylists(tripId)

  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  const [playlistDescription, setPlaylistDescription] = useState('')

  const handleCreatePlaylist = () => {
    createPlaylist.mutate(
      { name: playlistName, description: playlistDescription },
      {
        onSuccess: () => {
          setPlaylistDialogOpen(false)
          setPlaylistName('')
          setPlaylistDescription('')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading playlists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Road Trip Music</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Create playlists and add songs together
          </p>
        </div>
        {isAdmin && (
          <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Playlist</DialogTitle>
                <DialogDescription>
                  Create a new playlist for the trip
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Playlist Name *</Label>
                  <Input
                    id="name"
                    placeholder="Road Trip Vibes"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Songs for the drive"
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPlaylistDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={createPlaylist.isPending || !playlistName}
                >
                  {createPlaylist.isPending && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {createPlaylist.isPending ? 'Creating...' : 'Create Playlist'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {playlists && playlists.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Playlists List */}
          <div className="lg:col-span-1 space-y-3">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className={`cursor-pointer transition-all ${
                  selectedPlaylist === playlist.id ? 'border-primary shadow-md' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedPlaylist(playlist.id)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        {playlist.name}
                      </CardTitle>
                      {playlist.description && (
                        <CardDescription className="text-xs mt-1">
                          {playlist.description}
                        </CardDescription>
                      )}
                    </div>
                    {playlist.created_by === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Delete this playlist?')) {
                            deletePlaylist.mutate(playlist.id)
                            if (selectedPlaylist === playlist.id) {
                              setSelectedPlaylist(null)
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Selected Playlist Songs */}
          <div className="lg:col-span-2">
            {selectedPlaylist ? (
              <PlaylistView playlistId={selectedPlaylist} isAdmin={isAdmin} userId={user?.id} />
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Music className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">Select a playlist</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a playlist to view and add songs
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Music className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold mb-2">No playlists yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              {isAdmin
                ? 'Create your first playlist to start adding songs'
                : 'Only trip admins can create playlists'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PlaylistView({
  playlistId,
  isAdmin,
  userId,
}: {
  playlistId: string
  isAdmin: boolean
  userId?: string
}) {
  const { songs, isLoading, addSong, togglePlayed, deleteSong } = usePlaylistSongs(playlistId)
  const [songDialogOpen, setSongDialogOpen] = useState(false)
  const [songTitle, setSongTitle] = useState('')
  const [songArtist, setSongArtist] = useState('')
  const [songUrl, setSongUrl] = useState('')

  const handleAddSong = () => {
    addSong.mutate(
      { title: songTitle, artist: songArtist, url: songUrl },
      {
        onSuccess: () => {
          setSongDialogOpen(false)
          setSongTitle('')
          setSongArtist('')
          setSongUrl('')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Songs</CardTitle>
          <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Song
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Song</DialogTitle>
                <DialogDescription>Add a song from Spotify, YouTube, or any music service</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Song Title *</Label>
                  <Input
                    id="title"
                    placeholder="Bohemian Rhapsody"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist *</Label>
                  <Input
                    id="artist"
                    placeholder="Queen"
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Song URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://open.spotify.com/track/..."
                    value={songUrl}
                    onChange={(e) => setSongUrl(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSongDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSong}
                  disabled={addSong.isPending || !songTitle || !songArtist || !songUrl}
                >
                  {addSong.isPending && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {addSong.isPending ? 'Adding...' : 'Add Song'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {songs && songs.length > 0 ? (
          <div className="space-y-3">
            {songs.map((song) => {
              const userInitials = song.user?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || song.user?.email?.[0].toUpperCase() || '?'

              return (
                <div
                  key={song.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    song.played ? 'bg-muted/50 opacity-75' : 'bg-background'
                  }`}
                >
                  <Checkbox
                    checked={song.played}
                    onCheckedChange={() => togglePlayed.mutate({ songId: song.id, played: song.played })}
                    disabled={!isAdmin}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={song.user?.avatar_url} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${song.played ? 'line-through' : ''}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={song.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    {song.added_by === userId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (confirm('Remove this song?')) {
                            deleteSong.mutate(song.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No songs yet. Add the first one!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
