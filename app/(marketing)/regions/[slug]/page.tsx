import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { regionBySlugQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { RecommendationGrid } from '@/components/marketing/RecommendationGrid'
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

const dangerLevelLabels: Record<NonNullable<Region['dangerLevel']>, string> = {
  low: '低',
  medium: '中',
  high: '高',
}

const EMPTY_VALUE_TEXT = '未记录'
const EMPTY_REGION_SUMMARY_TEXT = '暂无区域概述。'
const EMPTY_TRAVEL_ADVICE_TEXT = '暂无行进建议记录。'

function labelForDangerLevel(level?: Region['dangerLevel']) {
  if (!level) {
    return EMPTY_VALUE_TEXT
  }
  return dangerLevelLabels[level] ?? level
}

export default async function RegionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const region: Region | null = await client.fetch(regionBySlugQuery, {
    slug,
  })

  if (!region) {
    notFound()
  }

  const recommendations: RecommendationItem[] = []
  const seen = new Set<string>()
  const landmarks =
    region.landmarks && region.landmarks.length > 0
      ? region.landmarks.join(' / ')
      : EMPTY_VALUE_TEXT

  addRecommendations(recommendations, seen, region.featuredHeroes ?? [], 'hero')
  if (region.country) {
    addRecommendations(
      recommendations,
      seen,
      [{ ...region.country, _type: 'country' }],
      'country'
    )
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
    <div className="region-detail" style={region.themeColor ? { '--theme-hue': region.themeColor } as React.CSSProperties : undefined}>
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
            <span className="region-hero-tag">区域舞台</span>
            <h1 className="region-hero-title">{region.name}</h1>
            {region.country?.name && (
              <p className="region-hero-country">{region.country.name}</p>
            )}
            {region.summary && (
              <p className="region-hero-summary">{region.summary}</p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 detail-body">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
  <div className="rounded-2xl border bg-card p-5 sm:p-6">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
      区域概览
    </p>
    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
      <p>
        {region.summary ?? EMPTY_REGION_SUMMARY_TEXT}
      </p>
      <p>
        {region.travelAdvice ?? EMPTY_TRAVEL_ADVICE_TEXT}
      </p>
    </div>
  </div>
  <div className="rounded-2xl border bg-card p-5 sm:p-6">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
      探索信息
    </p>
    <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
      <div className="flex items-center justify-between">
        <span>地形</span>
        <span>{region.terrain ?? EMPTY_VALUE_TEXT}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>气候</span>
        <span>{region.climate ?? EMPTY_VALUE_TEXT}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>危险等级</span>
        <span>{labelForDangerLevel(region.dangerLevel)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>地标</span>
        <span className="text-right">{landmarks}</span>
      </div>
    </div>
  </div>
</section>

      {region.featuredHeroes && region.featuredHeroes.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">所属英雄</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              角色
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {region.featuredHeroes.map((hero) => (
              <Link
                key={hero._id}
                href={`/champions/${hero.slug.current}`}
                className="group w-36 shrink-0 rounded-xl border bg-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-square bg-muted">
                  <Image
                    src={hero.portrait ?? placeholders.hero}
                    alt={hero.name}
                    width={640}
                    height={640}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    sizes="144px"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold">{hero.name}</h3>
                  {hero.title && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {hero.title}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <RecommendationGrid items={recommendations} />
      </div>
    </div>
  )
}

