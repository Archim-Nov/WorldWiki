import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getUserProfile } from '@/lib/supabase/profile'
import { withLocalePrefix } from '@/i18n/path'

export default async function WriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const profile = await getUserProfile()

  if (!profile) {
    redirect(withLocalePrefix('/login?redirect=/writer', locale))
  }

  if (profile.role !== 'editor') {
    redirect(withLocalePrefix('/dashboard', locale))
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <nav className="flex flex-wrap gap-3 text-sm">
        <Link href={withLocalePrefix('/writer', locale)} className="rounded-lg border border-border px-3 py-2">
          Writer 首页
        </Link>
        <Link href={withLocalePrefix('/writer/new', locale)} className="rounded-lg border border-border px-3 py-2">
          新建条目
        </Link>
        <Link href={withLocalePrefix('/writer/settings', locale)} className="rounded-lg border border-border px-3 py-2">
          设置
        </Link>
      </nav>
      {children}
    </div>
  )
}
