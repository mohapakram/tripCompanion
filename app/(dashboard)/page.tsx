'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Trip } from '@/types'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [tripName, setTripName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    loadTrips()
    loadUser()
  }, [])

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function loadTrips() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        trip_members!inner(user_id)
      `)
      .eq('trip_members.user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load trips',
        variant: 'destructive',
      })
    } else {
      setTrips(data || [])
    }
    setLoading(false)
  }

  async function createTrip() {
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('trips')
      .insert({
        name: tripName,
        start_date: startDate,
        end_date: endDate,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success!',
        description: 'Trip created successfully',
      })
      setOpen(false)
      setTripName('')
      setStartDate('')
      setEndDate('')
      router.push(`/trip/${data.id}`)
    }
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading trips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-0 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Your Trips</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Manage and view all your adventures</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Trip</DialogTitle>
              <DialogDescription>
                Start planning your next adventure
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tripName">Trip Name</Label>
                <Input
                  id="tripName"
                  placeholder="Summer Beach Trip 2024"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTrip} disabled={creating || !tripName || !startDate || !endDate}>
                {creating && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {creating ? 'Creating...' : 'Create Trip'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {trips.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-xl font-semibold mb-2">No trips yet</p>
            <p className="text-muted-foreground mb-4">Create your first trip to get started</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {trips.map((trip) => {
            const isCreator = trip.created_by === user?.id

            return (
              <Card key={trip.id} className="group relative hover:shadow-lg transition-shadow">
                <div onClick={() => router.push(`/trip/${trip.id}`)} className="cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base lg:text-lg">{trip.name}</CardTitle>
                        <CardDescription className="text-xs lg:text-sm">
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </CardDescription>
                      </div>
                      {isCreator && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={deleting === trip.id}
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (confirm('Are you sure you want to delete this trip?')) {
                                setDeleting(trip.id)
                                const { error } = await supabase.from('trips').delete().eq('id', trip.id)
                                if (!error) {
                                  loadTrips()
                                  toast({ title: 'Trip deleted successfully' })
                                } else {
                                  toast({ title: 'Error deleting trip', variant: 'destructive' })
                                }
                                setDeleting(null)
                              }
                            }}
                          >
                            {deleting === trip.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-xs lg:text-sm text-muted-foreground">
                        Click to view details
                      </p>
                      {isCreator && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Owner
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
