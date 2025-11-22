'use client'

import { use } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { useTripMember } from '@/lib/hooks/useTripMember'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { ActivityForm } from '@/components/activities/ActivityForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, MapPin, Upload, Target } from 'lucide-react'
import Link from 'next/link'
import { formatTime } from '@/lib/utils'

export default function DayActivitiesPage({
  params,
}: {
  params: Promise<{ tripId: string; day: string }>
}) {
  const { tripId, day } = use(params)
  const dayNumber = parseInt(day)

  const { activities, isLoading, createActivity, toggleVote, deleteActivity } = useActivities(
    tripId,
    dayNumber
  )
  const { isAdmin, userId } = useTripMember(tripId)

  // Sort activities by time
  const sortedActivities = activities?.sort((a, b) => a.time.localeCompare(b.time))

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-4">
          <Link href={`/trip/${tripId}/activities`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Day {dayNumber}</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              {sortedActivities?.length || 0} activities planned
            </p>
          </div>
        </div>
        {isAdmin && (
          <ActivityForm
            day={dayNumber}
            onSubmit={(data) => createActivity.mutate(data)}
            isSubmitting={createActivity.isPending}
          />
        )}
      </div>

      {/* Timeline View */}
      {sortedActivities && sortedActivities.length > 0 ? (
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border hidden lg:block" />

          {sortedActivities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-0 hidden lg:flex items-center justify-center w-12">
                <div className={`w-4 h-4 rounded-full border-2 ${activity.finalized ? 'bg-primary border-primary' : 'bg-background border-border'}`} />
              </div>

              {/* Activity Card */}
              <div className="lg:ml-12">
                <Card className={activity.finalized ? 'border-primary border-2' : ''}>
                  <CardContent className="p-4 lg:p-6">
                    {/* Time and Title */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg lg:text-xl font-bold text-primary">
                            {formatTime(activity.time)}
                          </span>
                          {activity.finalized && (
                            <span className="text-[10px] lg:text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              Final
                            </span>
                          )}
                        </div>
                        <h3 className="text-base lg:text-lg font-semibold">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>

                      {/* Vote button */}
                      <Button
                        variant={activity.user_voted ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleVote.mutate({ activityId: activity.id, userVoted: activity.user_voted || false })}
                        disabled={toggleVote.isPending}
                        className="flex items-center gap-1 h-8 lg:h-9 px-2 lg:px-3 flex-shrink-0"
                      >
                        {toggleVote.isPending ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <span className="text-xs">👍</span>
                        )}
                        <span className="text-xs font-medium">{activity.votes_count || 0}</span>
                      </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {activity.location_url && (
                        <a
                          href={activity.location_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="h-8 text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            View on Map
                          </Button>
                        </a>
                      )}

                      <Link href={`/trip/${tripId}/media`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload Media
                        </Button>
                      </Link>

                      <Link href={`/trip/${tripId}/games/challenges`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Challenges
                        </Button>
                      </Link>

                      {(isAdmin || activity.created_by === userId) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteActivity.mutate(activity.id)}
                          disabled={deleteActivity.isPending}
                          className="h-8 text-xs text-destructive"
                        >
                          {deleteActivity.isPending ? (
                            <>
                              <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Deleting...
                            </>
                          ) : (
                            'Delete'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-base lg:text-lg font-semibold mb-2">No activities planned</p>
            <p className="text-xs lg:text-sm text-muted-foreground mb-4">
              {isAdmin ? `Add your first activity for Day ${dayNumber}` : 'No activities planned yet. Only trip admins can add activities.'}
            </p>
            {isAdmin && (
              <ActivityForm
                day={dayNumber}
                onSubmit={(data) => createActivity.mutate(data)}
                isSubmitting={createActivity.isPending}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
