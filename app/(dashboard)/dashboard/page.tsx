'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { withLocalePrefix } from '@/i18n/path'
import { defaultLocale, isValidLocale } from '@/i18n/routing'
import type { UserRole } from '@/types/profile'

export default function DashboardPage() {
  const locale = useLocale()
  const activeLocale = isValidLocale(locale) ? locale : defaultLocale
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            setRole(profile?.role ?? null)
          })
      }
    })
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push(withLocalePrefix('/', activeLocale))
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">个人资料</h1>
      {user && (
        <div className="space-y-4">
          <p>欢迎，{user.email}</p>
          <div className="flex flex-wrap gap-3">
            {role === 'editor' && (
              <>
                <Link
                  href="/studio"
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                  进入 Studio
                </Link>
                <Link
                  href={withLocalePrefix('/writer', activeLocale)}
                  className="rounded-md border px-4 py-2"
                >
                  进入 Writer
                </Link>
              </>
            )}
            <button onClick={handleLogout} className="rounded-md border px-4 py-2">
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
