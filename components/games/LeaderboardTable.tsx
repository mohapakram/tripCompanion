'use client'

import { LeaderboardEntry } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy } from 'lucide-react'

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[]
}

const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-600']

export function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  return (
    <Card>
      <CardHeader className="p-4 lg:p-6">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <Trophy className="h-4 w-4 lg:h-5 lg:w-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        <div className="space-y-2 lg:space-y-4">
          {leaderboard.map((entry, index) => {
            const initials = entry.user?.full_name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() || '?'

            return (
              <div
                key={entry.user_id}
                className="flex items-center justify-between p-2 lg:p-3 rounded-lg hover:bg-accent active:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
                  <div className={`text-lg lg:text-2xl font-bold w-6 lg:w-8 flex-shrink-0 ${rankColors[index] || ''}`}>
                    {index === 0 && <Trophy className="h-5 w-5 lg:h-6 lg:w-6" />}
                    {index > 0 && `#${index + 1}`}
                  </div>
                  <Avatar className="h-8 w-8 lg:h-10 lg:w-10 flex-shrink-0">
                    <AvatarImage src={entry.user?.avatar_url} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm lg:text-base truncate">{entry.user?.full_name || 'Unknown'}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl lg:text-2xl font-bold text-primary">{entry.total_points}</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">points</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
