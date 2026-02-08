import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { creatureBySlugQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { PortableContent } from '@/components/portable/PortableContent'
import { RecommendationGrid } from '@/components/marketing/RecommendationGrid'
import {
  addRecommendations,
  RecommendationItem,
  RecommendationSource,
} from '@/lib/recommendations'

const categoryLabels: Record<string, string> = {
  animal: '动物',
  plant: '植物',
  element: '元素',
}

function labelForCategory(value?: string) {
  if (!value) return null
  return categoryLabels[value] ?? value
}

type Creature = {
  _id: string
  name: string
  species?: string
  portrait?: string
  category?: string
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

export default async function CreatureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const creature: Creature | null = await client.fetch(creatureBySlugQuery, {
    slug,
  })

  if (!creature) {
    notFound()
  }

  const recommendations: RecommendationItem[] = []
  const seen = new Set<string>()

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
    <div className="creature-detail" style={(creature.region?.themeColor || creature.country?.themeColor) ? { '--theme-hue': creature.region?.themeColor ?? creature.country?.themeColor } as React.CSSProperties : undefined}>
      <section className="creature-hero">
        <div className="creature-hero-bleed">
          <img
            src={creature.portrait ?? placeholders.creature}
            alt={creature.name}
            className="creature-hero-image"
          />
          <div className="creature-hero-overlay" />
        </div>
        <div className="creature-hero-content">
          <div className="creature-hero-lockup">
            <span className="creature-hero-tag">Specimen Sheet</span>
            <h1 className="creature-hero-title">{creature.name}</h1>
            <div className="creature-hero-tags">
              {creature.category && (
                <span>{labelForCategory(creature.category)}</span>
              )}
              {creature.species && <span>{creature.species}</span>}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 detail-body">
      <section className="rounded-3xl border bg-card p-6">
        <div className="rounded-2xl border p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">分类</span>
            <span>{labelForCategory(creature.category) ?? '未记录'}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-muted-foreground">区域</span>
            {creature.region?.name ? (
              <Link
                href={`/regions/${creature.region.slug.current}`}
                className="text-primary"
              >
                {creature.region.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">未记录</span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-muted-foreground">国家</span>
            {creature.country?.name ? (
              <Link
                href={`/countries/${creature.country.slug.current}`}
                className="text-primary"
              >
                {creature.country.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">未记录</span>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-1 rounded-full bg-primary/70" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Ecology
            </p>
            <h2 className="text-xl font-semibold">生态描述</h2>
          </div>
        </div>
        {creature.bio && creature.bio.length > 0 ? (
          <div className="mt-4">
            <PortableContent value={creature.bio} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">
            生物描述将在后续阶段完成富文本渲染与段落排版。
          </p>
        )}
      </section>

      <RecommendationGrid items={recommendations} />
      </div>
    </div>
  )
}
