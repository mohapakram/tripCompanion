'use client'

import { use } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TruthOrDareGenerator } from '@/components/games/TruthOrDareGenerator'
import Link from 'next/link'
import { Trophy, Target, Dices } from 'lucide-react'

export default function GamesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Trip Games</h1>
        <p className="text-sm lg:text-base text-muted-foreground">Challenges, competitions, and fun activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Link href={`/trip/${tripId}/games/challenges`}>
          <Card className="hover:shadow-lg active:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="p-4 lg:p-6">
              <Target className="h-6 w-6 lg:h-8 lg:w-8 text-primary mb-2" />
              <CardTitle className="text-base lg:text-lg">Challenges</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Complete fun challenges to earn points and compete with your friends
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/trip/${tripId}/games/leaderboard`}>
          <Card className="hover:shadow-lg active:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="p-4 lg:p-6">
              <Trophy className="h-6 w-6 lg:h-8 lg:w-8 text-primary mb-2" />
              <CardTitle className="text-base lg:text-lg">Leaderboard</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                See who's winning and track everyone's points
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <TruthOrDareGenerator />

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <Dices className="h-6 w-6 lg:h-8 lg:w-8 text-primary mb-2" />
            <CardTitle className="text-base lg:text-lg">Quick Stats</CardTitle>
            <CardDescription className="text-xs lg:text-sm">
              Challenge yourself and your friends to make the trip memorable!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
