import Link from 'next/link'
import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { withLocalePrefix } from '@/i18n/path'

type RecommendationItem = {
  _id: string
  title: string
  href: string
  image: string
  typeLabel: string
}

export async function RecommendationGrid({
  title,
  subtitle,
  items,
}: {
  title?: string
  subtitle?: string
  items: RecommendationItem[]
}) {
  const locale = await getLocale()
  const t = await getTranslations('RecommendationGrid')
  const resolvedTitle = title ?? t('title')
  const resolvedSubtitle = subtitle ?? t('subtitle')
  const displayItems = items.slice(0, 3)

  const localizeTypeLabel = (href: string, fallback: string) => {
    if (href.startsWith('/champions/')) return t('types.hero')
    if (href.startsWith('/regions/')) return t('types.region')
    if (href.startsWith('/countries/')) return t('types.country')
    if (href.startsWith('/creatures/')) return t('types.creature')
    if (href.startsWith('/stories/')) return t('types.story')
    if (href.startsWith('/magics/')) return t('types.magic')
    return fallback
  }

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{resolvedTitle}</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {resolvedSubtitle}
        </span>
      </div>
      {displayItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          {displayItems.map((item) => (
            <Link
              key={item._id}
              href={withLocalePrefix(item.href, locale)}
              className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={960}
                  height={720}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {localizeTypeLabel(item.href, item.typeLabel)}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      )}
    </section>
  )
}
