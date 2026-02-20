'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { LocalizedLink } from '@/components/i18n/LocalizedLink'
import { withLocalePrefix } from '@/i18n/path'
import { defaultLocale, isValidLocale } from '@/i18n/routing'

export default function RegisterPage() {
  const t = useTranslations('AuthRegister')
  const locale = useLocale()
  const activeLocale = isValidLocale(locale) ? locale : defaultLocale

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const defaultRedirect = withLocalePrefix('/dashboard', activeLocale)
  const redirectParam = searchParams.get('redirect')
  const redirectTo =
    redirectParam && redirectParam.startsWith('/') ? redirectParam : defaultRedirect

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      const loginPath = withLocalePrefix('/login', activeLocale)
      router.push(`${loginPath}?registered=true&redirect=${encodeURIComponent(redirectTo)}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-2xl font-bold mb-8 text-center">{t('title')}</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">{t('email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            minLength={6}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md"
        >
          {loading ? t('loading') : t('submit')}
        </button>
      </form>
      <p className="text-center mt-4 text-sm">
        {t('loginPrompt')}{' '}
        <LocalizedLink
          href={{
            pathname: '/login',
            query: { redirect: redirectTo },
          }}
          className="underline"
        >
          {t('loginLink')}
        </LocalizedLink>
      </p>
    </div>
  )
}
