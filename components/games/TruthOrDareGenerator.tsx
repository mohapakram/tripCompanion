'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shuffle } from 'lucide-react'

const truths = [
  "What's the most embarrassing thing you've done on a trip?",
  "What's your biggest travel fear?",
  "Have you ever gotten lost in a foreign country?",
  "What's the weirdest food you've ever tried?",
  "What's your most memorable travel moment?",
  "Have you ever missed a flight? What happened?",
  "What's the longest you've gone without showering on a trip?",
  "What's your travel guilty pleasure?",
  "Have you ever pretended to speak a language you don't know?",
  "What's the most you've spent on a souvenir?",
]

const dares = [
  "Speak in an accent for the next 10 minutes",
  "Do 10 jumping jacks right now",
  "Sing your favorite song",
  "Tell a joke to the group",
  "Post an embarrassing photo on social media",
  "Do your best celebrity impression",
  "Swap an item of clothing with someone",
  "Dance with no music for 30 seconds",
  "Call a friend and sing them happy birthday",
  "Eat a spoonful of a condiment",
]

export function TruthOrDareGenerator() {
  const [current, setCurrent] = useState<{ type: 'truth' | 'dare'; text: string } | null>(null)

  const generate = (type: 'truth' | 'dare') => {
    const list = type === 'truth' ? truths : dares
    const random = list[Math.floor(Math.random() * list.length)]
    setCurrent({ type, text: random })
  }

  return (
    <Card>
      <CardHeader className="p-4 lg:p-6">
        <CardTitle className="text-base lg:text-lg">Truth or Dare</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4 p-4 lg:p-6">
        <div className="flex gap-3 lg:gap-4">
          <Button onClick={() => generate('truth')} className="flex-1 h-10 lg:h-11 text-sm lg:text-base">
            Truth
          </Button>
          <Button onClick={() => generate('dare')} className="flex-1 h-10 lg:h-11 text-sm lg:text-base" variant="secondary">
            Dare
          </Button>
        </div>

        {current && (
          <div className="p-4 lg:p-6 bg-accent rounded-lg text-center">
            <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-2">
              {current.type.toUpperCase()}
            </p>
            <p className="text-sm lg:text-lg font-semibold">{current.text}</p>
          </div>
        )}

        {current && (
          <Button
            onClick={() => generate(current.type)}
            variant="outline"
            className="w-full h-10 lg:h-11 text-sm lg:text-base"
          >
            <Shuffle className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
            Generate Another
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
