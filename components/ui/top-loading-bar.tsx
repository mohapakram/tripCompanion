'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function TopLoadingBar() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    // Reset progress when pathname changes (navigation complete)
    setProgress(100)
    const timer = setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    if (!isLoading) return

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(timer)
  }, [isLoading])

  const startLoading = () => {
    setIsLoading(true)
    setProgress(20)
  }

  // Expose function to trigger loading globally
  useEffect(() => {
    const handleStartLoading = () => startLoading()
    
    // Listen for custom navigation events
    window.addEventListener('start-navigation', handleStartLoading)
    
    return () => {
      window.removeEventListener('start-navigation', handleStartLoading)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent">
      <div 
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}