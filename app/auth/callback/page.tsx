'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FullPageLoader } from '@/components/ui/loading-spinner'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Give the route handler time to process
    const timeout = setTimeout(() => {
      router.push('/')
    }, 2000)

    return () => clearTimeout(timeout)
  }, [router])

  return <FullPageLoader />
}
