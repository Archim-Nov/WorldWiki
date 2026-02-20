import Link from 'next/link'
import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { regionBySlugQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { RecommendationGrid } from '@/components/marketing/RecommendationGrid'
import { withLocalePrefix } from '@/i18n/path'
import {
  addRecommendations,
  RecommendationItem,
  RecommendationSource,
} from '@/lib/recommendations'

type Region = {
  _id: string
  name: string
  summary?: string
  climate?: string
  terrain?: string
  dangerLevel?: 'low' | 'medium' | 'high'
  landmarks?: string[]
  travelAdvice?: string
  mapImage?: string
  themeColor?: string
  country?: { name: string; slug: { current: string }; mapImage?: string }
  featuredHeroes?: Array<{
    _id: string
    name: string
    title?: string
    slug: { current: string }
    portrait?: string
  }>
}

function dangerLevelTone(level?: Region['dangerLevel']) {
  if (level === 'high') {
    return 'text-red-600 bg-red-500/10 border-red-500/30'
  }
  if (level === 'medium') {
    return 'text-amber-600 bg-amber-500/10 border-amber-500/30'
  }
  if (level === 'low') {
    return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30'
  }
  return 'text-muted-foreground bg-muted border-border'
}

function labelForDangerLevel(
  level: Region['dangerLevel'] | undefined,
  t: (key: string) => string,
  emptyValue: string
) {
  if (!level) {
    return emptyValue
  }
  return t(`dangerLevels.${level}`)
}

export default async function RegionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const locale = await getLocale()
  const t = await getTranslations('RegionDetailPage')
  const { slug } = await params
  const region: Region | null = await client.fetch(regionBySlugQuery, {
    slug,
  })

  if (!region) {
    notFound()
  }

  const emptyValue = t('emptyValue')
  const recommendations: RecommendationItem[] = []
  const seen = new Set<string>()
  const landmarks = (region.landmarks ?? []).filter(Boolean)
  const heroCount = region.featuredHeroes?.length ?? 0

  addRecommendations(recommendations, seen, region.featuredHeroes ?? [], 'hero')
  if (region.country) {
    addRecommendations(recommendations, seen, [{ ...region.country, _type: 'country' }], 'country')
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const creaturesByRegion: RecommendationSource[] = await client.fetch(
      `*[_type == "creature" && defined(region) && region._ref == $regionId && !(_id in $excludeIds)] | order(name asc)[0..10] {
        _id,
        _type,
        name,
        slug,
        "portrait": portrait.asset->url
      }`,
      { regionId: region._id, excludeIds }
    )
    addRecommendations(recommendations, seen, creaturesByRegion, 'creature')
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const storiesByRegion: RecommendationSource[] = await client.fetch(
      `*[_type == "story" && references($regionId) && !(_id in $excludeIds)] | order(_createdAt desc)[0..10] {
        _id,
        _type,
        title,
        slug,
        "coverImage": coverImage.asset->url
      }`,
      { regionId: region._id, excludeIds }
    )
    addRecommendations(recommendations, seen, storiesByRegion, 'story')
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const fallback: RecommendationSource[] = await client.fetch(
      `*[_type in ["hero","region","country","creature","story","magic"] && !(_id in $excludeIds)] | order(_updatedAt desc)[0..10] {
        _id,
        _type,
        title,
        name,
        slug,
        "portrait": portrait.asset->url,
        "mapImage": mapImage.asset->url,
        "coverImage": coverImage.asset->url
      }`,
      { excludeIds }
    )
    addRecommendations(recommendations, seen, fallback)
  }

  return (
    <div
      className="region-detail"
      style={
        region.themeColor
          ? ({ '--theme-hue': region.themeColor } as React.CSSProperties)
          : undefined
      }
    >
      <section className="region-hero">
        <div className="region-hero-bleed">
          <Image
            src={region.mapImage ?? placeholders.region}
            alt={region.name}
            width={1800}
            height={900}
            className="region-hero-image"
            sizes="100vw"
            priority
          />
          <div className="region-hero-overlay" />
        </div>
        <div className="region-hero-content">
          <div className="region-hero-lockup">
            <span className="region-hero-tag">{t('heroTag')}</span>
            <h1 className="region-hero-title">{region.name}</h1>
            {region.country?.name ? <p className="region-hero-country">{region.country.name}</p> : null}
            {region.summary ? <p className="region-hero-summary">{region.summary}</p> : null}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 detail-body">
        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-3xl border bg-card p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('overviewTitle')}</p>
            <p className="mt-4 text-base leading-7 text-foreground/90">
              {region.summary ?? t('emptySummary')}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('fields.climate')}</p>
                <p className="mt-2 text-sm font-medium">{region.climate ?? emptyValue}</p>
              </div>
              <div className="rounded-2xl border bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('fields.terrain')}</p>
                <p className="mt-2 text-sm font-medium">{region.terrain ?? emptyValue}</p>
              </div>
              <div className="rounded-2xl border bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t('fields.dangerLevel')}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${dangerLevelTone(region.dangerLevel)}`}
                >
                  {labelForDangerLevel(region.dangerLevel, t, emptyValue)}
                </span>
              </div>
              <div className="rounded-2xl border bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t('fields.relatedHeroes')}
                </p>
                <p className="mt-2 text-sm font-medium">{heroCount}</p>
              </div>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-3xl border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('travelAdviceTitle')}</p>
              <p className="mt-4 text-sm leading-7 text-foreground/85">
                {region.travelAdvice ?? t('emptyTravelAdvice')}
              </p>
            </article>

            <article className="rounded-3xl border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('countryTitle')}</p>
              {region.country ? (
                <Link
                  href={withLocalePrefix(`/countries/${region.country.slug.current}`, locale)}
                  className="mt-4 block overflow-hidden rounded-2xl border bg-background/60 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[16/9] bg-muted">
                    <Image
                      src={region.country.mapImage ?? placeholders.country}
                      alt={region.country.name}
                      width={960}
                      height={540}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 1024px) 100vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">{t('countryArchive')}</p>
                    <p className="mt-1 text-lg font-semibold">{region.country.name}</p>
                  </div>
                </Link>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">{t('emptyCountry')}</p>
              )}
            </article>
          </aside>
        </section>

        <section className="mt-8 rounded-3xl border bg-card p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{t('landmarksTitle')}</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t('landmarksSubtitle')}
            </span>
          </div>
          {landmarks.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {landmarks.map((landmark) => (
                <span
                  key={landmark}
                  className="inline-flex rounded-full border bg-background/60 px-4 py-2 text-sm"
                >
                  {landmark}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">{emptyValue}</p>
          )}
        </section>

        {region.featuredHeroes && region.featuredHeroes.length > 0 ? (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('featuredHeroesTitle')}</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t('featuredHeroesSubtitle')}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {region.featuredHeroes.map((hero) => (
                <Link
                  key={hero._id}
                  href={withLocalePrefix(`/champions/${hero.slug.current}`, locale)}
                  className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[4/5] bg-muted">
                    <Image
                      src={hero.portrait ?? placeholders.hero}
                      alt={hero.name}
                      width={640}
                      height={640}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold">{hero.name}</h3>
                    {hero.title ? <p className="mt-1 truncate text-sm text-muted-foreground">{hero.title}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <RecommendationGrid items={recommendations} />
      </div>
    </div>
  )
}
