'use client'

import { Activity } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThumbsUp, MapPin, Trash2 } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ActivityCardProps {
  activity: Activity
  onVote: (activityId: string, userVoted: boolean) => void
  onDelete?: (activityId: string) => void
  canDelete?: boolean
}

export function ActivityCard({ activity, onVote, onDelete, canDelete }: ActivityCardProps) {
  return (
    <Card className={cn(activity.finalized && 'border-primary border-2')}>
      <CardHeader className="p-4 lg:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base lg:text-lg truncate">{activity.title}</CardTitle>
            <p className="text-xs lg:text-sm text-muted-foreground mt-1">
              {formatTime(activity.time)}
              {activity.finalized && (
                <span className="ml-2 text-[10px] lg:text-xs bg-primary text-primary-foreground px-1.5 lg:px-2 py-0.5 rounded">
                  Final Plan
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-1 lg:gap-2 flex-shrink-0">
            <Button
              variant={activity.user_voted ? 'default' : 'outline'}
              size="sm"
              onClick={() => onVote(activity.id, activity.user_voted || false)}
              className="flex items-center gap-1 h-8 lg:h-9 px-2 lg:px-3"
            >
              <ThumbsUp className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="text-xs">{activity.votes_count || 0}</span>
            </Button>
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(activity.id)}
                className="h-8 w-8 lg:h-9 lg:w-9 p-0"
              >
                <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {(activity.description || activity.location_url) && (
        <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
          {activity.description && (
            <p className="text-xs lg:text-sm text-muted-foreground mb-2">{activity.description}</p>
          )}
          {activity.location_url && (
            <a
              href={activity.location_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs lg:text-sm text-primary hover:underline active:underline flex items-center gap-1"
            >
              <MapPin className="h-3 w-3" />
              View Location
            </a>
          )}
        </CardContent>
      )}
    </Card>
  )
}
