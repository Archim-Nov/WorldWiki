import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getUserProfile } from '@/lib/supabase/profile'
import { withLocalePrefix } from '@/i18n/path'

export const metadata = {
  title: 'Sanity Studio',
}

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const profile = await getUserProfile()

  if (!profile) {
    redirect(withLocalePrefix('/login?redirect=/dashboard', locale))
  }

  if (profile.role !== 'editor') {
    redirect(withLocalePrefix('/dashboard', locale))
  }

  return children
}
