'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Calendar, Camera, Gamepad2, Home, Settings, Music } from 'lucide-react'

interface SidebarProps {
  tripId: string
}

const navItems = [
  { href: '', label: 'Home', icon: Home },
  { href: '/activities', label: 'Activities', icon: Calendar },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/music', label: 'Music', icon: Music },
  { href: '/media', label: 'Media', icon: Camera },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ tripId }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-card border-r border-border h-screen sticky top-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">Trip Companion</h2>
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const href = `/trip/${tripId}${item.href}`
            const isActive = pathname === href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const href = `/trip/${tripId}${item.href}`
            const isActive = pathname === href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-[60px]',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
