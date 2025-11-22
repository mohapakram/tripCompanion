'use client'

import { use, useState, useEffect } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { useTripMember } from '@/lib/hooks/useTripMember'
import { useDayAttendance } from '@/lib/hooks/useDayAttendance'
import { useAuth } from '@/components/auth/AuthProvider'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { ActivityForm } from '@/components/activities/ActivityForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { getDayDate, getTripDays } from '@/lib/utils'
import { UserPlus, UserMinus } from 'lucide-react'
import Link from 'next/link'

export default function ActivitiesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const { user } = useAuth()
  const { activities, isLoading, createActivity, toggleVote, deleteActivity } = useActivities(tripId)
  const { isAdmin, userId } = useTripMember(tripId)
  const { attendance, joinDay, leaveDay } = useDayAttendance(tripId)
  const [trip, setTrip] = useState<any>(null)
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

  // Group activities by day
  const activitiesByDay = activities?.reduce((acc, activity) => {
    if (!acc[activity.day]) {
      acc[activity.day] = []
    }
    acc[activity.day].push(activity)
    return acc
  }, {} as Record<number, typeof activities>)

  const days = Object.keys(activitiesByDay || {}).map(Number).sort((a, b) => a - b)
  const [selectedDay, setSelectedDay] = useState<number>(days[0] || 1)

  const getDayLabel = (day: number) => {
    if (!trip) return `Day ${day}`
    const date = getDayDate(trip.start_date, day)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' })
    return { dayName, dateStr }
  }

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
          <h1 className="text-2xl lg:text-3xl font-bold">Activities</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Plan and vote on trip activities</p>
        </div>
      </div>

      {days.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No activities yet</CardTitle>
            <CardDescription>
              {isAdmin ? 'Start by adding your first activity' : 'No activities planned yet. Only trip admins can add activities.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin && (
              <ActivityForm
                day={1}
                onSubmit={(data) => createActivity.mutate(data)}
                isSubmitting={createActivity.isPending}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(Number(v))}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0 mb-4">
            <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
              <TabsList className="w-max lg:w-auto">
                {days.map((day) => {
                  const { dayName, dateStr } = getDayLabel(day)
                  return (
                    <TabsTrigger
                      key={day}
                      value={day.toString()}
                      className="text-xs lg:text-sm flex flex-col items-start px-3 lg:px-4"
                    >
                      <span className="font-semibold">Day {day}</span>
                      <span className="text-[10px] lg:text-xs text-muted-foreground font-normal">
                        {dayName} - {dateStr}
                      </span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>
            {isAdmin && (
              <ActivityForm
                day={selectedDay}
                onSubmit={(data) => createActivity.mutate(data)}
                isSubmitting={createActivity.isPending}
              />
            )}
          </div>

          {days.map((day) => (
            <TabsContent key={day} value={day.toString()} className="space-y-4">
              {activitiesByDay?.[day]?.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onVote={(id, voted) => toggleVote.mutate({ activityId: id, userVoted: voted })}
                  onDelete={(id) => deleteActivity.mutate(id)}
                  canDelete={isAdmin || activity.created_by === userId}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Vertical Timeline */}
      <div className="relative max-w-4xl mx-auto mt-6">
        {/* Timeline line */}
        <div className="absolute left-8 lg:left-12 top-0 bottom-0 w-0.5 bg-border" />

        {/* Timeline items */}
        <div className="space-y-6">
          {allDays.map((day) => {
            const { dayName, dateStr } = getDayLabel(day)
            const dayAttendees = attendance?.filter(a => a.day === day) || []
            const isUserAttending = dayAttendees.some(a => a.user_id === user?.id)

            return (
              <div key={day} className="relative flex items-start gap-4 lg:gap-6 group">
                {/* Timeline dot */}
                <div className="relative z-10 flex items-center justify-center w-16 lg:w-24 flex-shrink-0">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm lg:text-base group-hover:scale-110 transition-transform">
                    {day}
                  </div>
                </div>

                {/* Content card */}
                <Card className="flex-1 hover:shadow-lg transition-all group-hover:border-primary">
                  <CardHeader className="p-4 lg:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/trip/${tripId}/activities/${day}`} className="flex-1">
                        <CardTitle className="text-lg lg:text-xl mb-2">Day {day}</CardTitle>
                        <CardDescription className="text-sm lg:text-base mb-1">
                          {dayName} - {dateStr}
                        </CardDescription>
                        <CardDescription className="text-xs lg:text-sm text-muted-foreground">
                          {activitiesByDay?.[day]?.length || 0} {activitiesByDay?.[day]?.length === 1 ? 'activity' : 'activities'}
                        </CardDescription>
                      </Link>

                      {/* Attendees and Join/Leave button */}
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        {/* Attendee avatars */}
                        {dayAttendees.length > 0 && (
                          <div className="flex -space-x-2">
                            {dayAttendees.slice(0, 3).map((attendee) => {
                              const initials = attendee.user?.full_name
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase() || attendee.user?.email?.[0].toUpperCase() || '?'

                              return (
                                <Avatar key={attendee.id} className="h-8 w-8 border-2 border-background">
                                  <AvatarImage src={attendee.user?.avatar_url} />
                                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                </Avatar>
                              )
                            })}
                            {dayAttendees.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs font-medium">+{dayAttendees.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Join/Leave button */}
                        <Button
                          size="sm"
                          variant={isUserAttending ? 'outline' : 'default'}
                          onClick={() => {
                            if (isUserAttending) {
                              leaveDay.mutate(day)
                            } else {
                              joinDay.mutate(day)
                            }
                          }}
                          disabled={joinDay.isPending || leaveDay.isPending}
                          className="h-8"
                        >
                          {(joinDay.isPending || leaveDay.isPending) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : isUserAttending ? (
                            <>
                              <UserMinus className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Leave</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Join</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
