'use client'

import { Check, Languages } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { defaultLocale, isValidLocale, localeCookieName, locales, type AppLocale } from '@/i18n/routing'
import { stripLocalePrefix, withLocalePrefix } from '@/i18n/path'

const options: Array<{ value: AppLocale }> = locales.map((value) => ({ value }))

function localeFromPath(pathname: string): AppLocale | null {
  const firstSegment = pathname.split('/')[1]
  return isValidLocale(firstSegment) ? firstSegment : null
}

function localeFromCookie(): AppLocale | null {
  if (typeof document === 'undefined') return null
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${localeCookieName}=`))
  if (!cookie) return null
  const value = cookie.slice(localeCookieName.length + 1)
  return isValidLocale(value) ? value : null
}

export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher')
  const localeFromIntl = useLocale()

  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const searchParams = useSearchParams()
  const currentLocale =
    localeFromPath(pathname) ??
    localeFromCookie() ??
    (isValidLocale(localeFromIntl) ? localeFromIntl : defaultLocale)

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const query = searchParams?.toString() ?? ''

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('buttonAria')}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors ${
          open ? 'text-primary' : 'hover:text-primary'
        }`}
      >
        <Languages size={16} strokeWidth={1.8} />
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={`absolute left-1/2 top-[calc(100%+1.15rem)] z-50 w-44 -translate-x-1/2 origin-top isolate overflow-visible rounded-xl border border-border/45 bg-background/80 p-1.5 shadow-[0_18px_28px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-saturate-150 transition duration-200 ease-out ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
        }`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border/45 bg-background/80"
        />
        {options.map((option) => {
          const selected = option.value === currentLocale
          return (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              onClick={() => {
                window.localStorage.setItem(localeCookieName, option.value)
                document.cookie = `${localeCookieName}=${option.value}; path=/; max-age=31536000; samesite=lax`
                const nextPath = withLocalePrefix(stripLocalePrefix(pathname), option.value)
                router.replace(query ? `${nextPath}?${query}` : nextPath)
                router.refresh()
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition duration-150 ${
                selected
                  ? 'bg-accent text-accent-foreground'
                  : 'text-popover-foreground hover:bg-accent/70 hover:text-accent-foreground'
              }`}
            >
              <span>{t(`options.${option.value}`)}</span>
              <Check
                size={14}
                strokeWidth={2}
                className={`transition-opacity duration-150 ${selected ? 'opacity-100' : 'opacity-0'}`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
