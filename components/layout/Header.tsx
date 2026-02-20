'use client'

import { ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { ScrollHeader } from './ScrollHeader'
import { UserNav } from './UserNav'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { LocalizedLink } from '@/components/i18n/LocalizedLink'
import { withLocalePrefix } from '@/i18n/path'
import { defaultLocale, isValidLocale } from '@/i18n/routing'

export function Header() {
  const t = useTranslations('Header')
  const locale = useLocale()
  const activeLocale = isValidLocale(locale) ? locale : defaultLocale

  const navItems = [
    { href: '/countries', label: t('nav.countries') },
    { href: '/regions', label: t('nav.regions') },
    { href: '/creatures', label: t('nav.creatures') },
    { href: '/champions', label: t('nav.champions') },
    { href: '/magics', label: t('nav.magics') },
    { href: '/stories', label: t('nav.stories') },
  ]

  return (
    <ScrollHeader>
      <div className="mx-auto w-full max-w-[88rem] px-3 py-3 sm:px-4 sm:py-0 sm:h-16 flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
        <div className="flex flex-wrap items-center gap-5 sm:gap-8 sm:justify-self-start">
          <LocalizedLink href="/" className="font-semibold text-lg sm:text-xl tracking-wide" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            WorldWiki
          </LocalizedLink>
          <span aria-hidden="true" className="text-muted-foreground/55 text-lg leading-none">
            |
          </span>
          <nav className="flex flex-wrap items-center gap-5 text-base sm:gap-7 sm:text-[1.02rem]">
            {navItems.map((item) => (
              <LocalizedLink key={item.href} href={item.href} className="nav-link text-foreground/90 transition-colors hover:text-primary">
                {item.label}
              </LocalizedLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 sm:justify-self-end">
          <form action={withLocalePrefix('/search', activeLocale)} method="get" className="relative w-52 sm:w-56">
            <input
              name="q"
              type="search"
              placeholder={t('search.placeholder')}
              aria-label={t('search.aria')}
              enterKeyHint="search"
              className="h-9 w-full rounded-full border border-border/40 bg-background/45 pl-4 pr-9 text-sm text-foreground/90 placeholder:text-muted-foreground/70 outline-none backdrop-blur-xl backdrop-saturate-150 transition focus:border-primary/55 focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              aria-label={t('search.submit')}
              className="absolute right-0 top-0 inline-flex h-9 w-9 items-center justify-center text-foreground/75 transition-colors hover:text-primary"
            >
              <ChevronRight size={14} strokeWidth={1.8} />
            </button>
          </form>
          <LanguageSwitcher />
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </ScrollHeader>
  )
}
