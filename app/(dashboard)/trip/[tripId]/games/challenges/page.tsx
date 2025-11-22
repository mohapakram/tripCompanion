'use client'

import { use } from 'react'
import { useChallenges } from '@/lib/hooks/useChallenges'
import { ChallengeCard } from '@/components/games/ChallengeCard'
import { ChallengeForm } from '@/components/games/ChallengeForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/components/auth/AuthProvider'

export default function ChallengesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const { user } = useAuth()
  const { challenges, submissions, isLoading, submitChallenge, createChallenge } = useChallenges(tripId)

  const userSubmissions = submissions?.filter((s) => s.user_id === user?.id) || []
  const submittedChallengeIds = new Set(userSubmissions.map((s) => s.challenge_id))

  const challengesByCategory = challenges?.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = []
    }
    acc[challenge.category].push(challenge)
    return acc
  }, {} as Record<string, typeof challenges>)

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Challenges</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Complete challenges to earn points</p>
        </div>
        <ChallengeForm
          onSubmit={(data) => createChallenge.mutate(data)}
          isSubmitting={createChallenge.isPending}
        />
      </div>

      <Tabs defaultValue="all">
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <TabsList className="w-max lg:w-auto">
            <TabsTrigger value="all" className="text-xs lg:text-sm">All</TabsTrigger>
            <TabsTrigger value="photo" className="text-xs lg:text-sm">Photo</TabsTrigger>
            <TabsTrigger value="dare" className="text-xs lg:text-sm">Dare</TabsTrigger>
            <TabsTrigger value="scavenger" className="text-xs lg:text-sm">Scavenger</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4 mt-4 lg:mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {challenges?.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onSubmit={(id) => submitChallenge.mutate({ challengeId: id })}
                isSubmitting={submitChallenge.isPending}
                hasSubmitted={submittedChallengeIds.has(challenge.id)}
              />
            ))}
          </div>
        </TabsContent>

        {['photo', 'dare', 'scavenger'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4 mt-4 lg:mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {challengesByCategory?.[category]?.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onSubmit={(id) => submitChallenge.mutate({ challengeId: id })}
                  isSubmitting={submitChallenge.isPending}
                  hasSubmitted={submittedChallengeIds.has(challenge.id)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
