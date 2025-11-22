import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()

  // Get the invite code
  const { data: invite, error: inviteError } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (inviteError || !invite) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to signup with invite code
    return NextResponse.redirect(
      new URL(`/signup?invite=${code}`, request.url)
    )
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('trip_members')
    .select('*')
    .eq('trip_id', invite.trip_id)
    .eq('user_id', user.id)
    .single()

  if (!existingMember) {
    // Add user to trip
    await supabase.from('trip_members').insert({
      trip_id: invite.trip_id,
      user_id: user.id,
      role: 'user',
    })
  }

  // Redirect to trip
  return NextResponse.redirect(
    new URL(`/trip/${invite.trip_id}`, request.url)
  )
}
