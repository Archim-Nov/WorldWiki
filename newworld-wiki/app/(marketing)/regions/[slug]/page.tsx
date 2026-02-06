import Link from 'next/link'
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
  mapImage?: string
  country?: { name: string; slug: { current: string }; mapImage?: string }
  featuredHeroes?: Array<{
    _id: string
    name: string
    title?: string
    slug: { current: string }
    portrait?: string
  }>
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
      `*[_type in ["hero","region","country","creature","story"] && !(_id in $excludeIds)] | order(_updatedAt desc)[0..10] {
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
    <div className="region-detail container mx-auto px-4 py-16">
      <section className="relative overflow-hidden rounded-3xl border bg-card">
        <div className="aspect-[4/3] bg-muted sm:aspect-[5/2]">
          <img
            src={region.mapImage ?? placeholders.region}
            alt={region.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-6 max-w-2xl text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Region Stage
          </p>
          <h1 className="text-4xl font-semibold mt-3">{region.name}</h1>
          {region.country?.name && (
            <p className="text-xs uppercase tracking-[0.2em] mt-3 text-white/80">
              {region.country.name}
            </p>
          )}
          {region.summary && (
            <p className="text-sm mt-4 text-white/85">{region.summary}</p>
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Region Notes
          </p>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>这里是故事的舞台，记录地貌、气候与传说线索。</p>
            <p>后续可以补充地图坐标、关键地点与事件时间线。</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Exploration
          </p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>地理特征</span>
              <span>场景/遗迹/边境</span>
            </div>
            <div className="flex items-center justify-between">
              <span>气候</span>
              <span>可补充</span>
            </div>
            <div className="flex items-center justify-between">
              <span>故事线索</span>
              <span>可补充</span>
            </div>
          </div>
        </div>
      </section>

      {region.featuredHeroes && region.featuredHeroes.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">所属英雄</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Cast
            </span>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {region.featuredHeroes.map((hero) => (
              <Link
                key={hero._id}
                href={`/champions/${hero.slug.current}`}
                className="group min-w-[220px] rounded-2xl border bg-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/5] bg-muted">
                  <img
                    src={hero.portrait ?? placeholders.hero}
                    alt={hero.name}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{hero.name}</h3>
                  {hero.title && (
                    <p className="text-sm text-muted-foreground mt-1">
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
  )
}
