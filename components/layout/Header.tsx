'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/components/auth/AuthProvider'
import { LogOut, ArrowLeft, List } from 'lucide-react'

interface HeaderProps {
  tripName?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ tripName, showBack, onBack }: HeaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user?.email?.[0].toUpperCase() || '?'

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
              <Link href="/">
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
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs lg:text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">
              {user?.user_metadata?.full_name || user?.email}
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
