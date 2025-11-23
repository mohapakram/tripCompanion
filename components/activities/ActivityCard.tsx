'use client'

import { Activity } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThumbsUp, MapPin, Trash2 } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ActivityCardProps {
  activity: Activity
  onVote?: (activityId: string, userVoted: boolean) => void
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
          <div className="flex items-center gap-2">
            {onVote && (
              <Button
                variant={activity.user_voted ? 'default' : 'outline'}
                size="sm"
                onClick={() => onVote(activity.id, activity.user_voted || false)}
                className="flex items-center gap-1 h-8 lg:h-9 px-2 lg:px-3"
              >
                <ThumbsUp className={cn("h-3 w-3 lg:h-4 lg:w-4", activity.user_voted && "fill-current")} />
                <span className="text-xs">{activity.votes_count || 0}</span>
              </Button>
            )}
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
      {/* Show voters if any */}
      {activity.voters && activity.voters.length > 0 && (
        <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs lg:text-sm text-muted-foreground font-medium">
              {activity.voters.length === 1 ? 'Going' : `${activity.voters.length} going`}:
            </span>
            <div className="flex -space-x-2">
              {activity.voters.slice(0, 5).map((voter) => (
                <Avatar 
                  key={voter.id} 
                  className="h-6 w-6 lg:h-8 lg:w-8 border-2 border-background hover:scale-110 transition-transform"
                  title={voter.user?.full_name || 'Unknown User'}
                >
                  <AvatarImage src={voter.user?.avatar_url} alt={voter.user?.full_name} />
                  <AvatarFallback className="text-xs lg:text-sm bg-primary/10 text-primary">
                    {voter.user?.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {activity.voters.length > 5 && (
                <div 
                  className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center hover:scale-110 transition-transform"
                  title={`${activity.voters.length - 5} more people going`}
                >
                  <span className="text-xs text-muted-foreground font-medium">+{activity.voters.length - 5}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
