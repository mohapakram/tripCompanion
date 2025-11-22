'use client'

import { useState } from 'react'
import { Media } from '@/types'
import { Button } from '@/components/ui/button'
import { Lightbox } from './Lightbox'
import { Trash2, Play } from 'lucide-react'
import Image from 'next/image'

interface MediaGridProps {
  media: Media[]
  onDelete?: (mediaId: string) => void
  canDelete?: boolean
}

export function MediaGrid({ media, onDelete, canDelete }: MediaGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
        {media.map((item, index) => (
          <div
            key={item.id}
            className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => setLightboxIndex(index)}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt="Trip media"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
            )}

            {canDelete && onDelete && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs truncate">
                {item.user?.full_name || 'Unknown'}
              </p>
              {item.day && (
                <p className="text-white/80 text-xs">Day {item.day}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          media={media}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
