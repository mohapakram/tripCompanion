'use client'

import { use } from 'react'
import { useLeaderboard } from '@/lib/hooks/useLeaderboard'
import { LeaderboardTable } from '@/components/games/LeaderboardTable'

export default function LeaderboardPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const { leaderboard, isLoading } = useLeaderboard(tripId)

  if (isLoading) {
    return <div className="p-6">Loading leaderboard...</div>
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Leaderboard</h1>
        <p className="text-sm lg:text-base text-muted-foreground">See who's leading the competition</p>
      </div>

      {leaderboard && leaderboard.length > 0 ? (
        <LeaderboardTable leaderboard={leaderboard} />
      ) : (
        <div className="text-center py-12 text-sm lg:text-base text-muted-foreground">
          No scores yet. Complete challenges to get on the leaderboard!
        </div>
      )}
    </div>
  )
}
