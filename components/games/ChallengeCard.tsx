'use client'

import { Challenge } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Camera, MapPin } from 'lucide-react'

interface ChallengeCardProps {
  challenge: Challenge
  onSubmit: (challengeId: string) => void
  isSubmitting: boolean
  hasSubmitted?: boolean
}

const categoryColors = {
  photo: 'bg-blue-500',
  dare: 'bg-orange-500',
  scavenger: 'bg-green-500',
}

const categoryLabels = {
  photo: 'Photo',
  dare: 'Dare',
  scavenger: 'Scavenger',
}

export function ChallengeCard({ challenge, onSubmit, isSubmitting, hasSubmitted }: ChallengeCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 lg:gap-2 mb-2 flex-wrap">
              <Badge className={`${categoryColors[challenge.category]} text-[10px] lg:text-xs px-1.5 lg:px-2`}>
                {categoryLabels[challenge.category]}
              </Badge>
              <Badge variant="outline" className="text-[10px] lg:text-xs px-1.5 lg:px-2">{challenge.points} pts</Badge>
            </div>
            <CardTitle className="text-sm lg:text-base">{challenge.text}</CardTitle>
            {challenge.location_required && (
              <p className="text-[10px] lg:text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <MapPin className="h-3 w-3" />
                Location required
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
        <Button
          size="sm"
          onClick={() => onSubmit(challenge.id)}
          disabled={isSubmitting || hasSubmitted}
          variant={hasSubmitted ? 'outline' : 'default'}
          className="w-full h-9 lg:h-10 text-xs lg:text-sm"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Submitting...
            </>
          ) : hasSubmitted ? (
            'Submitted'
          ) : (
            <>
              <Camera className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
              Submit Challenge
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
