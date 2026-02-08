import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { storyBySlugQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { PortableContent } from '@/components/portable/PortableContent'
import { RecommendationGrid } from '@/components/marketing/RecommendationGrid'
import { StoryScrollFade } from '@/components/marketing/StoryScrollFade'
import {
  addRecommendations,
  RecommendationItem,
  RecommendationSource,
} from '@/lib/recommendations'

type Story = {
  _id: string
  title: string
  coverImage?: string
  content?: unknown[]
  linkedRefs?: Array<{
    _id: string
    _type: string
    slug?: { current: string }
    title?: string
    name?: string
    portrait?: string
    mapImage?: string
  }>
  relatedHeroes?: Array<{
    _id: string
    name: string
    slug: { current: string }
    portrait?: string
  }>
  relatedRegions?: Array<{
    _id: string
    name: string
    slug: { current: string }
    mapImage?: string
  }>
  relatedCreatures?: Array<{
    _id: string
    name: string
    slug: { current: string }
    portrait?: string
  }>
}

type Recommendation = RecommendationItem

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const story: Story | null = await client.fetch(storyBySlugQuery, {
    slug,
  })

  if (!story) {
    notFound()
  }

  type HeroItem = {
    _id: string
    name: string
    slug: { current: string }
    portrait?: string
  }

  type RegionItem = {
    _id: string
    name: string
    slug: { current: string }
    mapImage?: string
  }

  type CreatureItem = {
    _id: string
    name: string
    slug: { current: string }
    portrait?: string
  }

  const linkedRefs = story.linkedRefs ?? []
  const linkedRegions = linkedRefs.filter(
    (ref): ref is Required<typeof ref> =>
      ref._type === 'region' && Boolean(ref._id && ref.name && ref.slug?.current)
  )

  const recommendations: Recommendation[] = []
  const seen = new Set<string>()

  addRecommendations(recommendations, seen, story.relatedHeroes ?? [], 'hero')
  addRecommendations(recommendations, seen, story.relatedRegions ?? [], 'region')
  addRecommendations(
    recommendations,
    seen,
    story.relatedCreatures ?? [],
    'creature'
  )
  addRecommendations(
    recommendations,
    seen,
    linkedRefs as RecommendationSource[]
  )

  const regionIds = Array.from(
    new Set(
      [...(story.relatedRegions ?? []), ...(linkedRegions as RegionItem[])].map(
        (region) => region._id
      )
    )
  )

  if (recommendations.length < 3 && regionIds.length > 0) {
    const excludeIds = Array.from(seen)
    const heroesByRegion: HeroItem[] = await client.fetch(
      `*[_type == "hero" && defined(region) && region._ref in $regionIds && !(_id in $excludeIds)] | order(name asc)[0..10] {
        _id,
        name,
        slug,
        "portrait": portrait.asset->url
      }`,
      { regionIds, excludeIds }
    )
    addRecommendations(recommendations, seen, heroesByRegion, 'hero')
  }

  if (recommendations.length < 3 && regionIds.length > 0) {
    const excludeIds = Array.from(seen)
    const creaturesByRegion: CreatureItem[] = await client.fetch(
      `*[_type == "creature" && defined(region) && region._ref in $regionIds && !(_id in $excludeIds)] | order(name asc)[0..10] {
        _id,
        name,
        slug,
        "portrait": portrait.asset->url
      }`,
      { regionIds, excludeIds }
    )
    addRecommendations(recommendations, seen, creaturesByRegion, 'creature')
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const creaturesByStory: CreatureItem[] = await client.fetch(
      `*[_type == "creature" && references($storyId) && !(_id in $excludeIds)] | order(name asc)[0..10] {
        _id,
        name,
        slug,
        "portrait": portrait.asset->url
      }`,
      { storyId: story._id, excludeIds }
    )
    addRecommendations(recommendations, seen, creaturesByStory, 'creature')
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const regionFallback: RegionItem[] = await client.fetch(
      `*[_type == "region" && !(_id in $excludeIds)] | order(name asc)[0..10] {
        _id,
        name,
        slug,
        "mapImage": mapImage.asset->url
      }`,
      { excludeIds }
    )
    addRecommendations(recommendations, seen, regionFallback, 'region')
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const heroesFallback: HeroItem[] = await client.fetch(
      `*[_type == "hero" && !(_id in $excludeIds)] | order(name asc)[0..10] {
        _id,
        name,
        slug,
        "portrait": portrait.asset->url
      }`,
      { excludeIds }
    )
    addRecommendations(recommendations, seen, heroesFallback, 'hero')
  }

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const creaturesFallback: CreatureItem[] = await client.fetch(
      `*[_type == "creature" && !(_id in $excludeIds)] | order(name asc)[0..10] {
        _id,
        name,
        slug,
        "portrait": portrait.asset->url
      }`,
      { excludeIds }
    )
    addRecommendations(recommendations, seen, creaturesFallback, 'creature')
  }

  return (
    <div className="story-detail">
      <StoryScrollFade />
      <section className="story-hero">
        <div className="story-hero-bleed">
          <img
            src={story.coverImage ?? placeholders.story}
            alt={story.title}
            className="story-hero-image"
          />
          <div className="story-hero-overlay" />
        </div>
        <div className="story-hero-content">
          <div className="story-hero-lockup">
            <span className="story-hero-tag">Short Story</span>
            <h1 className="story-hero-title">{story.title}</h1>
          </div>
        </div>
        <div className="story-scroll-cta">
          <span>滚屏以开始</span>
          <i className="story-scroll-arrow" />
        </div>
      </section>

      <div className="container mx-auto px-4 story-body-wrap">
        <header className="story-article-header">
          <span className="story-article-tag">Short Story</span>
          <h2 className="story-article-title">{story.title}</h2>
          <span className="story-article-divider" />
        </header>

        <section className="story-body">
          <article className="story-body-card">
            {story.content && story.content.length > 0 ? (
              <div className="story-body-content">
                <PortableContent value={story.content} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-7">
                故事正文将在后续阶段完成富文本排版与渲染。这里将承载更具沉浸感的
                叙事段落、章节标题与引文。
              </p>
            )}
          </article>
        </section>

        <RecommendationGrid items={recommendations} />
      </div>
    </div>
  )
}
