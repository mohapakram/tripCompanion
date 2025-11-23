'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, getTripDays } from '@/lib/utils'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { Calendar, Camera, Gamepad2, Users, Upload, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function getCurrentDay(startDate: string, endDate: string) {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Trip hasn't started
  if (now < start) {
    const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return { status: 'upcoming', daysUntil }
  }

  // Trip has ended
  if (now > end) {
    return { status: 'ended', day: 0 }
  }

  // Trip is ongoing
  const dayNumber = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return { status: 'ongoing', day: dayNumber }
}

export default function TripDashboard({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = use(params)
  const { push: navigateWithLoading } = useNavigationLoading()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      
      try {
        // First, fetch the trip to get start/end dates
        const { data: trip, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single()

        if (tripError) {
          console.error('Error fetching trip:', tripError)
          return
        }

        // Calculate current day info
        const currentDayInfo = trip ? getCurrentDay(trip.start_date, trip.end_date) : { status: 'upcoming', daysUntil: 0 }
        const currentDay = currentDayInfo.status === 'ongoing' ? currentDayInfo.day : 1

        // Then fetch the rest of the data in parallel
        const [
          { data: members },
          { data: activities },
          { data: todayActivities },
          { data: media },
          { data: { user } },
          { data: challenges }
        ] = await Promise.all([
          supabase.from('trip_members').select('*, profiles(*)').eq('trip_id', tripId),
          supabase.from('activities').select('*').eq('trip_id', tripId).limit(5),
          supabase.from('activities').select('*').eq('trip_id', tripId).eq('day', currentDay),
          supabase.from('media').select('*').eq('trip_id', tripId).limit(6),
          supabase.auth.getUser(),
          supabase.from('challenges').select('*').eq('trip_id', tripId).limit(3),
        ])

        const totalDays = trip ? getTripDays(trip.start_date, trip.end_date) : 0
        const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

        setDashboardData({
          trip,
          currentDayInfo,
          currentDay,
          members,
          activities,
          todayActivities,
          media,
          user,
          challenges,
          totalDays,
          userName
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [tripId, supabase])

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    navigateWithLoading(href)
  }

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return <div className="p-6">Error loading dashboard data</div>
  }

  const { 
    trip, 
    currentDayInfo, 
    currentDay, 
    members, 
    activities, 
    todayActivities, 
    media, 
    user, 
    challenges, 
    totalDays, 
    userName 
  } = dashboardData

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Greeting Header */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          {getGreeting()}, {userName} {currentDayInfo.status === 'upcoming' ? '✈️' : currentDayInfo.status === 'ongoing' ? '☀️' : '🎉'}
        </h1>
        {currentDayInfo.status === 'upcoming' && (
          <p className="text-base lg:text-lg text-muted-foreground font-medium">
            📦 Pack up! Trip starts in {currentDayInfo.daysUntil} {currentDayInfo.daysUntil === 1 ? 'day' : 'days'}
          </p>
        )}
        {currentDayInfo.status === 'ongoing' && (
          <p className="text-base lg:text-lg text-primary font-semibold">
            Day {currentDayInfo.day} in {trip?.name}
          </p>
        )}
        {currentDayInfo.status === 'ended' && (
          <p className="text-base lg:text-lg text-muted-foreground font-medium">
            Trip completed! Hope you had a great time!
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{totalDays}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium">Activities</CardTitle>
            <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{activities?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium">Media</CardTitle>
            <Camera className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{media?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium">Members</CardTitle>
            <Users className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{members?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Today */}
      {currentDayInfo.status === 'ongoing' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Button 
            variant="outline" 
            className="w-full h-20 flex flex-col gap-2"
            onClick={(e) => handleNavigation(`/trip/${tripId}/activities/${currentDayInfo.day}`, e)}
          >
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Today's Activities</span>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-20 flex flex-col gap-2"
            onClick={(e) => handleNavigation(`/trip/${tripId}/games/challenges`, e)}
          >
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Today's Challenges</span>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-20 flex flex-col gap-2"
            onClick={(e) => handleNavigation(`/trip/${tripId}/media`, e)}
          >
            <Upload className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Upload Media</span>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-20 flex flex-col gap-2"
            onClick={(e) => handleNavigation(`/trip/${tripId}/games/leaderboard`, e)}
          >
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Leaderboard</span>
          </Button>
        </div>
      )}

      {/* Today's Activities */}
      {currentDayInfo.status === 'ongoing' && todayActivities && todayActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Today's Schedule</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Day {currentDayInfo.day} activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayActivities.slice(0, 3).map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded border">
                <div className="text-xs lg:text-sm text-muted-foreground">
                  {activity.time}
                </div>
                <div className="flex-1">
                  <p className="text-xs lg:text-sm font-medium">{activity.title}</p>
                </div>
              </div>
            ))}
            <Button 
              variant="link" 
              className="w-full text-xs"
              onClick={(e) => handleNavigation(`/trip/${tripId}/activities/${currentDayInfo.day}`, e)}
            >
              View all activities →
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Recent Media</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Latest uploads from the trip</CardDescription>
          </CardHeader>
          <CardContent>
            {media && media.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {media.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="aspect-square bg-muted rounded-md overflow-hidden">
                    <img
                      src={item.url}
                      alt="Trip media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs lg:text-sm text-muted-foreground">No media uploaded yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Quick Access</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Navigate to features</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-xs"
              onClick={(e) => handleNavigation(`/trip/${tripId}/activities`, e)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              All Activities
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-xs"
              onClick={(e) => handleNavigation(`/trip/${tripId}/games`, e)}
            >
              <Gamepad2 className="h-4 w-4 mr-2" />
              Games
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-xs"
              onClick={(e) => handleNavigation(`/trip/${tripId}/media`, e)}
            >
              <Camera className="h-4 w-4 mr-2" />
              Media
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-xs"
              onClick={(e) => handleNavigation(`/trip/${tripId}/settings`, e)}
            >
              <Users className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
