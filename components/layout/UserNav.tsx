'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function UserNav() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <span className="inline-block w-8 h-8" />
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-muted-foreground transition-colors hover:text-primary"
      >
        登录
      </Link>
    )
  }

  const initial = (user.email?.[0] ?? '?').toUpperCase()

  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-opacity hover:opacity-80"
    >
      {initial}
    </Link>
  )
}
