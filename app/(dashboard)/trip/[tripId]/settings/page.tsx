'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Copy, UserPlus } from 'lucide-react'
import { TripMember, InviteCode } from '@/types'
import { generateInviteCode } from '@/lib/utils'

export default function SettingsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const [members, setMembers] = useState<TripMember[]>([])
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [tripId])

  async function loadData() {
    const [{ data: membersData }, { data: inviteData }] = await Promise.all([
      supabase
        .from('trip_members')
        .select('*, user:profiles(*)')
        .eq('trip_id', tripId),
      supabase
        .from('invite_codes')
        .select('*')
        .eq('trip_id', tripId)
        .single(),
    ])

    setMembers(membersData || [])
    setInviteCode(inviteData)
    setLoading(false)
  }

  async function createInviteCode() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const code = generateInviteCode()

    const { data, error } = await supabase
      .from('invite_codes')
      .insert({
        trip_id: tripId,
        code,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setInviteCode(data)
      toast({ title: 'Invite code created!' })
    }
  }

  function copyInviteLink() {
    const link = `${window.location.origin}/api/invite/${inviteCode?.code}`
    navigator.clipboard.writeText(link)
    toast({ title: 'Invite link copied!' })
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trip Settings</h1>
        <p className="text-muted-foreground">Manage members and trip settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite Members</CardTitle>
          <CardDescription>Share this link with friends to invite them to the trip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inviteCode ? (
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/api/invite/${inviteCode.code}`}
              />
              <Button onClick={copyInviteLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          ) : (
            <Button onClick={createInviteCode}>
              <UserPlus className="h-4 w-4 mr-2" />
              Generate Invite Link
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trip Members ({members.length})</CardTitle>
          <CardDescription>People on this trip</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => {
              const initials = member.user?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || '?'

              return (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
