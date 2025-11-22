'use client'

import { use } from 'react'
import { useMedia } from '@/lib/hooks/useMedia'
import { MediaGrid } from '@/components/media/MediaGrid'
import { MediaUpload } from '@/components/media/MediaUpload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/components/auth/AuthProvider'

export default function MediaPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const { user } = useAuth()
  const { media, isLoading, uploadMedia, deleteMedia } = useMedia(tripId)

  const mediaByDay = media?.reduce((acc, item) => {
    const day = item.day || 0
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(item)
    return acc
  }, {} as Record<number, typeof media>)

  const days = Object.keys(mediaByDay || {})
    .map(Number)
    .sort((a, b) => b - a)

  if (isLoading) {
    return <div className="p-6">Loading media...</div>
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Media Vault</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Your trip photos and videos</p>
        </div>
        <MediaUpload
          onUpload={(file, day) => uploadMedia.mutate({ file, day })}
          isUploading={uploadMedia.isPending}
        />
      </div>

      {!media || media.length === 0 ? (
        <div className="text-center py-12 text-sm lg:text-base text-muted-foreground">
          No media uploaded yet. Start by uploading your first photo or video!
        </div>
      ) : (
        <Tabs defaultValue="all">
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <TabsList className="w-max lg:w-auto">
              <TabsTrigger value="all" className="text-xs lg:text-sm">All Media ({media.length})</TabsTrigger>
              {days.map((day) => (
                <TabsTrigger key={day} value={day.toString()} className="text-xs lg:text-sm">
                  {day === 0 ? 'No Day' : `Day ${day}`} ({mediaByDay?.[day]?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            <MediaGrid
              media={media}
              onDelete={(id) => deleteMedia.mutate(id)}
              canDelete={true}
            />
          </TabsContent>

          {days.map((day) => (
            <TabsContent key={day} value={day.toString()} className="mt-6">
              <MediaGrid
                media={mediaByDay?.[day] || []}
                onDelete={(id) => deleteMedia.mutate(id)}
                canDelete={true}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
