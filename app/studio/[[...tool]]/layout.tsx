import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/profile'

export const metadata = {
  title: 'Sanity Studio',
}

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login?redirect=/dashboard')
  }

  if (profile.role !== 'editor') {
    redirect('/dashboard')
  }

  return children
}
