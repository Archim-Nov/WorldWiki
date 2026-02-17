import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { magicBySlugQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { PortableContent } from '@/components/portable/PortableContent'
import { RecommendationGrid } from '@/components/marketing/RecommendationGrid'
import {
  addRecommendations,
  type RecommendationItem,
  type RecommendationSource,
} from '@/lib/recommendations'

type MagicDetail = {
  _id: string
  name: string
  kind?: 'principle' | 'spell'
  element?: 'fire' | 'wind' | 'earth' | 'water'
  school?: string
  summary?: string
  coverImage?: string
  details?: unknown[]
  relatedHeroes?: Array<{
    _id: string
    name: string
    slug: { current: string }
    portrait?: string
  }>
  relatedStories?: Array<{
    _id: string
    title: string
    slug: { current: string }
    coverImage?: string
  }>
  linkedRefs?: RecommendationSource[]
}

function elementLabel(element?: MagicDetail['element']) {
  if (element === 'fire') return '火'
  if (element === 'wind') return '风'
  if (element === 'earth') return '土'
  if (element === 'water') return '水'
  return null
}

export default async function MagicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const magic: MagicDetail | null = await client.fetch(magicBySlugQuery, { slug })

  if (!magic) {
    notFound()
  }

  const recommendations: RecommendationItem[] = []
  const seen = new Set<string>()
  const isPrinciple = magic.kind === 'principle'
  const element = elementLabel(magic.element)

  addRecommendations(recommendations, seen, magic.relatedHeroes ?? [], 'hero')
  addRecommendations(recommendations, seen, magic.relatedStories ?? [], 'story')
  addRecommendations(recommendations, seen, magic.linkedRefs ?? [])

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
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <section className="rounded-3xl border bg-card overflow-hidden">
        <div className="aspect-[16/7] bg-muted">
          <img
            src={magic.coverImage ?? placeholders.magic}
            alt={magic.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {isPrinciple ? '原理' : '法术'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-3">{magic.name}</h1>
          {magic.school ? (
            <p className="text-sm text-muted-foreground mt-2">{magic.school}</p>
          ) : null}
          {!isPrinciple && element ? (
            <p className="text-sm text-muted-foreground mt-1">元素：{element}</p>
          ) : null}
          {magic.summary ? (
            <p className="text-muted-foreground mt-4">{magic.summary}</p>
          ) : null}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-1 rounded-full bg-primary/70" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Details
            </p>
            <h2 className="text-xl font-semibold">
              {isPrinciple ? '原理设定' : '法术设定'}
            </h2>
          </div>
        </div>
        {magic.details && magic.details.length > 0 ? (
          <div className="mt-4">
            <PortableContent value={magic.details} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">
            {isPrinciple
              ? '该原理的详细设定将在后续补充。'
              : '该法术的详细设定将在后续补充。'}
          </p>
        )}
      </section>

      <RecommendationGrid items={recommendations} />
    </div>
  )
}
