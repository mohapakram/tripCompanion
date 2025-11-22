'use client'

import { useEffect, useState } from 'react'
import { Media } from '@/types'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  media: Media[]
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ media, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const current = media[currentIndex]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const prev = () => {
    setCurrentIndex((i) => (i === 0 ? media.length - 1 : i - 1))
  }

  const next = () => {
    setCurrentIndex((i) => (i === media.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {media.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/20"
            onClick={prev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/20"
            onClick={next}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8">
        {current.type === 'image' ? (
          <img
            src={current.url}
            alt="Trip media"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            src={current.url}
            controls
            className="max-w-full max-h-full"
          />
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="font-medium">{current.user?.full_name || 'Unknown'}</p>
        {current.day && <p className="text-sm text-white/80">Day {current.day}</p>}
        <p className="text-sm text-white/60 mt-2">
          {currentIndex + 1} / {media.length}
        </p>
      </div>
    </div>
  )
}
