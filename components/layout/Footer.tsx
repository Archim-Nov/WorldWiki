import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { withLocalePrefix } from '@/i18n/path'
import { defaultLocale, isValidLocale } from '@/i18n/routing'

export async function Footer() {
  const locale = await getLocale()
  const t = await getTranslations('Footer')
  const activeLocale = isValidLocale(locale) ? locale : defaultLocale

  return (
    <footer className="relative border-t border-border/50 py-6 sm:py-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-center text-muted-foreground">
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href={withLocalePrefix('/about', activeLocale)} className="transition-colors hover:text-primary">
            {t('about')}
          </Link>
          <Link href={withLocalePrefix('/contact', activeLocale)} className="transition-colors hover:text-primary">
            {t('contact')}
          </Link>
        </nav>
        <p className="text-xs">{t('copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  )
}
