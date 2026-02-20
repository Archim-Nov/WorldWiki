import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { withLocalePrefix } from '@/i18n/path'
import { defaultLocale, isValidLocale } from '@/i18n/routing'

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations('NotFound')
  const activeLocale = isValidLocale(locale) ? locale : defaultLocale

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-muted-foreground">{t('description')}</p>
      <Link
        href={withLocalePrefix('/', activeLocale)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        {t('backHome')}
      </Link>
    </div>
  )
}
