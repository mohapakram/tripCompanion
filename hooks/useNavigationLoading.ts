'use client'

import { useRouter } from 'next/navigation'
import { useLoading } from '@/components/providers/LoadingProvider'

// Helper function to trigger top loading bar
const triggerTopLoading = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('start-navigation'))
  }
}

export function useNavigationLoading() {
  const { setIsLoading } = useLoading()
  const router = useRouter()

  const push = (href: string) => {
    // Trigger top loading bar
    triggerTopLoading()
    
    // Small delay to ensure the loading state is visible
    setTimeout(() => {
      router.push(href)
    }, 10)
  }

  const replace = (href: string) => {
    // Trigger top loading bar
    triggerTopLoading()
    
    // Small delay to ensure the loading state is visible
    setTimeout(() => {
      router.replace(href)
    }, 10)
  }

  return {
    push,
    replace,
  }
}