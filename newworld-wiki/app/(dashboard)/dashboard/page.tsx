'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">个人资料</h1>
      {user && (
        <div className="space-y-4">
          <p>欢迎，{user.email}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/studio"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
            >
              进入 Studio
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border rounded-md"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
