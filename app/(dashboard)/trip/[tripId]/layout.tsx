import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = await params
  const supabase = await createClient()

  // Verify trip exists and user has access
  const { data: trip } = await supabase
    .from('trips')
    .select('*, trip_members!inner(*)')
    .eq('id', tripId)
    .single()

  if (!trip) {
    notFound()
  }

  return (
    <div className="flex h-screen">
      <Sidebar tripId={tripId} />
      <div className="flex-1 overflow-auto pb-16 lg:pb-0">
        {children}
      </div>
    </div>
  )
}
