import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to login or dashboard based on auth state
  // For now, just redirect to login
  redirect('/login')
}