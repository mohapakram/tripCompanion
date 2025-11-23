'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/components/auth/AuthProvider'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { LogOut, ArrowLeft, List } from 'lucide-react'

interface HeaderProps {
  tripName?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ tripName, showBack, onBack }: HeaderProps) {
  const { user, loading } = useAuth()
  const hasMounted = useHasMounted()
  const { push: navigateWithLoading } = useNavigationLoading()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigateWithLoading('/login')
  }

  const handleHomeNavigation = (e: React.MouseEvent) => {
    e.preventDefault()
    navigateWithLoading('/')
  }

  // Ensure consistent fallback during hydration
  const initials = !hasMounted || loading ? '?' : (user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user?.email?.[0].toUpperCase() || '?')

  return (
    <header className="h-14 lg:h-16 border-b border-border bg-background sticky top-0 z-40">
      <div className="h-full px-3 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-4">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {tripName && (
            <>
              <Link href="/" onClick={handleHomeNavigation}>
                <Button variant="ghost" size="icon" title="All Trips">
                  <List className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-base lg:text-xl font-semibold truncate max-w-[150px] lg:max-w-none">
                {tripName}
              </h1>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
            <AvatarImage src={hasMounted && !loading ? user?.user_metadata?.avatar_url : undefined} />
            <AvatarFallback className="text-xs lg:text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">
              {hasMounted && !loading && (user?.user_metadata?.full_name || user?.email)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8 lg:h-10 lg:w-10">
            <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
