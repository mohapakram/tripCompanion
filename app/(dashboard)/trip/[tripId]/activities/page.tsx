'use client'

import { use, useState, useEffect } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { useChallenges } from '@/lib/hooks/useChallenges'
import { useMedia } from '@/lib/hooks/useMedia'
import { useTripMember } from '@/lib/hooks/useTripMember'
import { useAuth } from '@/components/auth/AuthProvider'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { ActivityForm } from '@/components/activities/ActivityForm'
import { ChallengeCard } from '@/components/games/ChallengeCard'
import { MediaUpload } from '@/components/media/MediaUpload'
import { MediaGrid } from '@/components/media/MediaGrid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { getDayDate, getTripDays } from '@/lib/utils'
import { Plus, Calendar, Camera, Target } from 'lucide-react'
import Link from 'next/link'

export default function ActivitiesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const { user } = useAuth()
  const { activities, isLoading: activitiesLoading, createActivity, deleteActivity } = useActivities(tripId)
  const { challenges, isLoading: challengesLoading } = useChallenges(tripId)
  const { media, isLoading: mediaLoading, uploadMedia, deleteMedia } = useMedia(tripId)
  const { isAdmin, userId } = useTripMember(tripId)
  const [trip, setTrip] = useState<any>(null)
  const [showActivityForm, setShowActivityForm] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTrip() {
      const { data } = await supabase.from('trips').select('*').eq('id', tripId).single()
      setTrip(data)
    }
    fetchTrip()
  }, [tripId, supabase])

  // Calculate total days from trip dates
  const totalDays = trip ? getTripDays(trip.start_date, trip.end_date) : 0
  const allDays = Array.from({ length: totalDays }, (_, i) => i + 1)

  // Group data by day
  const activitiesByDay = activities?.reduce((acc, activity) => {
    if (!acc[activity.day]) {
      acc[activity.day] = []
    }
    acc[activity.day].push(activity)
    return acc
  }, {} as Record<number, typeof activities>)

  const challengesByDay = challenges?.reduce((acc, challenge) => {
    // For now, challenges don't have a day field, so we'll show them on all days
    // TODO: Add day field to challenges table
    allDays.forEach(day => {
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(challenge)
    })
    return acc
  }, {} as Record<number, typeof challenges>)

  const mediaByDay = media?.reduce((acc, item) => {
    const day = item.day || 0
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(item)
    return acc
  }, {} as Record<number, typeof media>)

  const days = Object.keys(activitiesByDay || {}).map(Number).sort((a, b) => a - b)
  const [selectedDay, setSelectedDay] = useState<number>(days[0] || 1)

  // Always return a consistent object shape for day labels to satisfy TS
  const getDayLabel = (day: number): { dayName: string; dateStr: string } => {
    if (!trip) {
      return { dayName: `Day ${day}`, dateStr: '' }
    }
    const date = getDayDate(trip.start_date, day)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' })
    return { dayName, dateStr }
  }

  const isLoading = activitiesLoading || challengesLoading || mediaLoading

  if (isLoading || !trip) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Trip Days</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Activities, challenges, and media organized by day</p>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {allDays.map((day) => {
          const { dayName, dateStr } = getDayLabel(day)
          const dayActivities = activitiesByDay?.[day] || []
          const dayChallenges = challengesByDay?.[day] || []
          const dayMedia = mediaByDay?.[day] || []

          return (
            <Card key={day} className="hover:shadow-lg transition-all hover:border-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Day {day}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {dayName} - {dateStr}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="activities" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activities" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Activities ({dayActivities.length})
                    </TabsTrigger>
                    <TabsTrigger value="challenges" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      Challenges ({dayChallenges.length})
                    </TabsTrigger>
                    <TabsTrigger value="media" className="text-xs">
                      <Camera className="h-3 w-3 mr-1" />
                      Media ({dayMedia.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Activities Tab */}
                  <TabsContent value="activities" className="space-y-3 mt-4">
                    {dayActivities.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No activities planned
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => setShowActivityForm(showActivityForm === day ? null : day)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Activity
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayActivities.map((activity) => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onDelete={(id) => deleteActivity.mutate(id)}
                            canDelete={isAdmin || activity.created_by === userId}
                          />
                        ))}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => setShowActivityForm(showActivityForm === day ? null : day)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Activity
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Activity Form */}
                    {showActivityForm === day && isAdmin && (
                      <div className="mt-4 p-3 border rounded-lg">
                        <ActivityForm
                          day={day}
                          onSubmit={(data) => {
                            createActivity.mutate(data)
                            setShowActivityForm(null)
                          }}
                          isSubmitting={createActivity.isPending}
                        />
                      </div>
                    )}
                  </TabsContent>

                  {/* Challenges Tab */}
                  <TabsContent value="challenges" className="space-y-3 mt-4">
                    {dayChallenges.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No challenges for this day
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayChallenges.slice(0, 3).map((challenge) => (
                          <div key={challenge.id} className="p-3 border rounded-lg">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="text-xs">
                                {challenge.category}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm">{challenge.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {challenge.points} points
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {dayChallenges.length > 3 && (
                          <Link href={`/trip/${tripId}/games/challenges`}>
                            <Button variant="ghost" size="sm" className="w-full">
                              View all challenges
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* Media Tab */}
                  <TabsContent value="media" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      <MediaUpload
                        onUpload={async (files) => {
                          const filesWithDay = files.map(f => ({ ...f, day }))
                          uploadMedia.mutate(filesWithDay)
                        }}
                        isUploading={uploadMedia.isPending}
                      />
                      
                      {dayMedia.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          No media uploaded for this day
                        </div>
                      ) : (
                        <MediaGrid
                          media={dayMedia}
                          onDelete={(id) => deleteMedia.mutate(id)}
                          canDelete={true}
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
