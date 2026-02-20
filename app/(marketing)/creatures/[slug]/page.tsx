import Link from 'next/link'
import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { creatureBySlugQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { PortableContent } from '@/components/portable/PortableContent'
import { RecommendationGrid } from '@/components/marketing/RecommendationGrid'
import { withLocalePrefix } from '@/i18n/path'
import {
  addRecommendations,
  RecommendationItem,
  RecommendationSource,
} from '@/lib/recommendations'

type Creature = {
  _id: string
  name: string
  species?: string
  portrait?: string
  category?: string
  temperament?: string
  habitat?: string
  diet?: string
  activityCycle?: string
  threatLevel?: 'low' | 'medium' | 'high'
  abilities?: string[]
  region?: {
    name: string
    slug: { current: string }
    _ref?: string
    themeColor?: string
    mapImage?: string
  }
  country?: { name: string; slug: { current: string }; themeColor?: string; mapImage?: string }
  bio?: unknown[]
  relatedStories?: Array<{
    _id: string
    title: string
    slug: { current: string }
    coverImage?: string
  }>
  linkedRefs?: Array<{
    _id: string
    _type: string
    slug?: { current: string }
    title?: string
    name?: string
    coverImage?: string
  }>
}

function labelForCategory(value: string | undefined, t: (key: string) => string) {
  if (!value) return null
  if (value === 'animal' || value === 'plant' || value === 'element') {
    return t(`categories.${value}`)
  }
  return value
}

function labelForThreatLevel(
  value: Creature['threatLevel'] | undefined,
  t: (key: string) => string,
  emptyValue: string
) {
  if (!value) return emptyValue
  return t(`threatLevels.${value}`)
}

export default async function CreatureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const locale = await getLocale()
  const t = await getTranslations('CreatureDetailPage')
  const { slug } = await params
  const creature: Creature | null = await client.fetch(creatureBySlugQuery, {
    slug,
  })

  if (!creature) {
    notFound()
  }

  const emptyValue = t('emptyValue')
  const recommendations: RecommendationItem[] = []
  const seen = new Set<string>()
  const abilities =
    creature.abilities && creature.abilities.length > 0
      ? creature.abilities.join(' / ')
      : emptyValue

  addRecommendations(recommendations, seen, creature.relatedStories ?? [], 'story')
  addRecommendations(
    recommendations,
    seen,
    (creature.linkedRefs ?? []) as RecommendationSource[]
  )
  if (creature.region) {
    addRecommendations(
      recommendations,
      seen,
      [{ ...creature.region, _type: 'region' }],
      'region'
    )
  }
  if (creature.country) {
    addRecommendations(
      recommendations,
      seen,
      [{ ...creature.country, _type: 'country' }],
      'country'
    )
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const storiesByCreature: RecommendationSource[] = await client.fetch(
      `*[_type == "story" && references($creatureId) && !(_id in $excludeIds)] | order(_createdAt desc)[0..10] {
        _id,
        _type,
        title,
        slug,
        "coverImage": coverImage.asset->url
      }`,
      { creatureId: creature._id, excludeIds }
    )
    addRecommendations(recommendations, seen, storiesByCreature, 'story')
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
      className="creature-detail"
      style={
        creature.region?.themeColor || creature.country?.themeColor
          ? ({
              '--theme-hue': creature.region?.themeColor ?? creature.country?.themeColor,
            } as React.CSSProperties)
          : undefined
      }
    >
      <section className="creature-hero">
        <div className="creature-hero-bleed">
          <Image
            src={creature.portrait ?? placeholders.creature}
            alt={creature.name}
            width={1800}
            height={900}
            className="creature-hero-image"
            sizes="100vw"
            priority
          />
          <div className="creature-hero-overlay" />
        </div>
        <div className="creature-hero-content">
          <div className="creature-hero-lockup">
            <span className="creature-hero-tag">{t('heroTag')}</span>
            <h1 className="creature-hero-title">{creature.name}</h1>
            <div className="creature-hero-tags">
              {creature.category ? <span>{labelForCategory(creature.category, t)}</span> : null}
              {creature.species ? <span>{creature.species}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 detail-body">
        <section className="rounded-3xl border bg-card p-6">
          <div className="rounded-2xl border p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('fields.category')}</span>
              <span>{labelForCategory(creature.category, t) ?? emptyValue}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-muted-foreground">{t('fields.region')}</span>
              {creature.region?.name ? (
                <Link
                  href={withLocalePrefix(`/regions/${creature.region.slug.current}`, locale)}
                  className="text-primary"
                >
                  {creature.region.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">{emptyValue}</span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-muted-foreground">{t('fields.country')}</span>
              {creature.country?.name ? (
                <Link
                  href={withLocalePrefix(`/countries/${creature.country.slug.current}`, locale)}
                  className="text-primary"
                >
                  {creature.country.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">{emptyValue}</span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('fields.habitat')}</span>
              <span>{creature.habitat ?? emptyValue}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('fields.diet')}</span>
              <span>{creature.diet ?? emptyValue}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('fields.temperament')}</span>
              <span>{creature.temperament ?? emptyValue}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('fields.activityCycle')}</span>
              <span>{creature.activityCycle ?? emptyValue}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('fields.threatLevel')}</span>
              <span>{labelForThreatLevel(creature.threatLevel, t, emptyValue)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('fields.abilities')}</span>
              <span className="text-right">{abilities}</span>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 rounded-full bg-primary/70" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t('ecologyKicker')}
              </p>
              <h2 className="text-xl font-semibold">{t('ecologyTitle')}</h2>
            </div>
          </div>
          {creature.bio && creature.bio.length > 0 ? (
            <div className="mt-4">
              <PortableContent value={creature.bio} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{t('emptyBio')}</p>
          )}
        </section>

        <RecommendationGrid items={recommendations} />
      </div>
    </div>
  )
}
