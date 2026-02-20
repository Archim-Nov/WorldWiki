import Link from 'next/link'
import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { countryBySlugQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { RecommendationGrid } from '@/components/marketing/RecommendationGrid'
import { withLocalePrefix } from '@/i18n/path'
import {
  addRecommendations,
  RecommendationItem,
  RecommendationSource,
} from '@/lib/recommendations'

type Country = {
  _id: string
  name: string
  kind?: 'nation' | 'organization'
  summary?: string
  capital?: string
  governance?: string
  population?: string
  currency?: string
  languages?: string[]
  motto?: string
  customs?: string
  mapImage?: string
  themeColor?: string
  featuredRegions?: Array<{
    _id: string
    name: string
    slug: { current: string }
    mapImage?: string
  }>
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const locale = await getLocale()
  const t = await getTranslations('CountryDetailPage')
  const { slug } = await params
  const country: Country | null = await client.fetch(countryBySlugQuery, {
    slug,
  })

  if (!country) {
    notFound()
  }

  const emptyValue = t('emptyValue')
  const regionCount = country.featuredRegions?.length ?? 0
  const isOrganization = country.kind === 'organization'
  const languages =
    country.languages && country.languages.length > 0
      ? country.languages.join(' / ')
      : emptyValue

  const recommendations: RecommendationItem[] = []
  const seen = new Set<string>()

  addRecommendations(recommendations, seen, country.featuredRegions ?? [], 'region')

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const heroesByCountry: RecommendationSource[] = await client.fetch(
      `*[_type == "hero" && defined(country) && country._ref == $countryId && !(_id in $excludeIds)] | order(name asc)[0..10] {
        _id,
        _type,
        name,
        slug,
        "portrait": portrait.asset->url
      }`,
      { countryId: country._id, excludeIds }
    )
    addRecommendations(recommendations, seen, heroesByCountry, 'hero')
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const creaturesByCountry: RecommendationSource[] = await client.fetch(
      `*[_type == "creature" && defined(country) && country._ref == $countryId && !(_id in $excludeIds)] | order(name asc)[0..10] {
        _id,
        _type,
        name,
        slug,
        "portrait": portrait.asset->url
      }`,
      { countryId: country._id, excludeIds }
    )
    addRecommendations(recommendations, seen, creaturesByCountry, 'creature')
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const storiesByCountry: RecommendationSource[] = await client.fetch(
      `*[_type == "story" && references($countryId) && !(_id in $excludeIds)] | order(_createdAt desc)[0..10] {
        _id,
        _type,
        title,
        slug,
        "coverImage": coverImage.asset->url
      }`,
      { countryId: country._id, excludeIds }
    )
    addRecommendations(recommendations, seen, storiesByCountry, 'story')
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
      className="country-detail"
      style={
        country.themeColor
          ? ({ '--theme-hue': country.themeColor } as React.CSSProperties)
          : undefined
      }
    >
      <section className="country-hero">
        <div className="country-hero-bleed">
          <Image
            src={country.mapImage ?? placeholders.country}
            alt={country.name}
            width={1800}
            height={900}
            className="country-hero-image"
            sizes="100vw"
            priority
          />
          <div className="country-hero-overlay" />
        </div>
        <div className="country-hero-content">
          <div className="country-hero-lockup">
            <span className="country-hero-tag">
              {isOrganization ? t('organizationTag') : t('nationTag')}
            </span>
            <h1 className="country-hero-title">{country.name}</h1>
            {country.summary ? <p className="country-hero-summary">{country.summary}</p> : null}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 detail-body">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {isOrganization ? t('countLabelOrganization') : t('countLabelNation')}
            </p>
            <p className="mt-3 text-2xl font-semibold">{regionCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t('recordedRegions')}</p>
          </div>

          <div className="rounded-2xl border bg-card p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('overviewTitle')}</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t('fields.capitalHQ')}</span>
                <span>{country.capital ?? emptyValue}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t('fields.governance')}</span>
                <span>{country.governance ?? emptyValue}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t('fields.populationScale')}</span>
                <span>{country.population ?? emptyValue}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('cultureTitle')}</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t('fields.currency')}</span>
                <span>{country.currency ?? emptyValue}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t('fields.languages')}</span>
                <span>{languages}</span>
              </div>
              {country.motto ? <p className="pt-1 text-muted-foreground">“{country.motto}”</p> : null}
              <p className="text-muted-foreground">{country.customs ?? t('emptyCustoms')}</p>
            </div>
          </div>
        </section>

        {country.featuredRegions && country.featuredRegions.length > 0 ? (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('relatedRegionsTitle')}</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t('relatedRegionsSubtitle')}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {country.featuredRegions.map((region) => (
                <Link
                  key={region._id}
                  href={withLocalePrefix(`/regions/${region.slug.current}`, locale)}
                  className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[4/5] bg-muted">
                    <Image
                      src={region.mapImage ?? placeholders.region}
                      alt={region.name}
                      width={960}
                      height={1200}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{region.name}</h3>
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
