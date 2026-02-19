import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { heroBySlugQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { PortableContent } from '@/components/portable/PortableContent'
import { RecommendationGrid } from '@/components/marketing/RecommendationGrid'
import {
  addRecommendations,
  RecommendationItem,
  RecommendationSource,
} from '@/lib/recommendations'

type Hero = {
  _id: string
  name: string
  title?: string
  alias?: string
  age?: string
  status?: 'active' | 'missing' | 'deceased'
  slug: { current: string }
  portrait?: string
  faction?: string
  roles?: string[]
  signatureWeapon?: string
  motto?: string
  region?: {
    name: string
    slug: { current: string }
    themeColor?: string
    mapImage?: string
  }
  country?: {
    name: string
    slug: { current: string }
    themeColor?: string
    mapImage?: string
  }
  bio?: unknown[]
  linkedRefs?: Array<{
    _id: string
    _type: string
    slug?: { current: string }
    title?: string
    name?: string
    portrait?: string
    mapImage?: string
    coverImage?: string
  }>
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
}

const heroStatusLabels: Record<NonNullable<Hero['status']>, string> = {
  active: 'Active',
  missing: 'Missing',
  deceased: 'Deceased',
}

function labelForHeroStatus(status?: Hero['status']) {
  if (!status) {
    return null
  }
  return heroStatusLabels[status] ?? status
}

export default async function HeroDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const hero: Hero | null = await client.fetch(heroBySlugQuery, {
    slug,
  })

  if (!hero) {
    notFound()
  }

  const relatedHeroes = hero.relatedHeroes ?? []
  const relatedStories = hero.relatedStories ?? []
  const statusLabel = labelForHeroStatus(hero.status)
  const recommendations: RecommendationItem[] = []
  const seen = new Set<string>()

  addRecommendations(recommendations, seen, relatedHeroes, 'hero')
  addRecommendations(recommendations, seen, relatedStories, 'story')
  addRecommendations(
    recommendations,
    seen,
    (hero.linkedRefs ?? []) as RecommendationSource[]
  )
  if (hero.region) {
    addRecommendations(
      recommendations,
      seen,
      [{ ...hero.region, _type: 'region' }],
      'region'
    )
  }
  if (hero.country) {
    addRecommendations(
      recommendations,
      seen,
      [{ ...hero.country, _type: 'country' }],
      'country'
    )
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
    <div className="hero-detail" style={(hero.region?.themeColor || hero.country?.themeColor) ? { '--theme-hue': hero.region?.themeColor ?? hero.country?.themeColor } as React.CSSProperties : undefined}>
      <section className="hero-hero">
        <div className="hero-hero-bleed">
          <Image
            src={hero.portrait ?? placeholders.hero}
            alt={hero.name}
            width={1920}
            height={1080}
            className="hero-hero-image"
            sizes="100vw"
            priority
          />
          <div className="hero-hero-overlay" />
        </div>
        <div className="hero-hero-content">
          <div className="hero-hero-lockup">
            <span className="hero-hero-tag">Champion Archive</span>
            <h1 className="hero-hero-title">{hero.name}</h1>
            {hero.title && (
              <p className="hero-hero-subtitle">{hero.title}</p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 detail-body">
      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.4fr_0.8fr]">
        <aside className="order-3 space-y-6 lg:order-1">
          <div className="rounded-2xl border bg-card p-4 hero-panel">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              相关英雄
            </p>
            {relatedHeroes.length > 0 ? (
              <div className="mt-4 space-y-3">
                {relatedHeroes.slice(0, 3).map((related) => (
                  <Link
                    key={related._id}
                    href={`/champions/${related.slug.current}`}
                    className="flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition hover:border-primary"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                      <Image
                        src={related.portrait ?? placeholders.hero}
                        alt={related.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        sizes="48px"
                      />
                    </div>
                    <span>{related.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-4">
                暂无关联英雄。
              </p>
            )}
          </div>
        </aside>

        <div className="order-1 space-y-6 lg:order-2">
          <div className="rounded-3xl border bg-card overflow-hidden hero-portrait-card">
            <div className="aspect-[3/4] bg-muted">
              <Image
                src={hero.portrait ?? placeholders.hero}
                alt={hero.name}
                width={960}
                height={1280}
                className="hero-portrait-img h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 text-center hero-panel hero-quote">
            <p className="text-sm text-muted-foreground hero-quote-text">
              {hero.motto
                ? `“${hero.motto}”`
                : '“如果我连规则都不知道，那我所做的一切又怎能被说是破坏规则？”'}
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-4 hero-quote-meta">
              — Champion Quote
            </p>
          </div>

          {hero.bio && hero.bio.length > 0 ? (
            <div className="hero-bio-wrapper">
              <input
                id="hero-bio-toggle"
                type="checkbox"
                className="hero-bio-toggle"
              />
              <label
                htmlFor="hero-bio-toggle"
                className="hero-bio-card rounded-3xl border bg-card p-6 hero-panel hero-bio"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="hero-panel-title text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    传记
                  </p>
                  <span className="hero-bio-hint text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    点击展开
                  </span>
                </div>
                <div
                  className="mt-4 hero-bio-preview hero-bio-content line-clamp-3"
                >
                  <PortableContent value={hero.bio} />
                </div>
              </label>

              <label
                htmlFor="hero-bio-toggle"
                className="hero-bio-backdrop"
                aria-hidden="true"
              />
              <div className="hero-bio-overlay">
                <div className="hero-bio-window">
                  <div className="hero-bio-header">
                    <p className="hero-panel-title text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      传记
                    </p>
                    <label
                      htmlFor="hero-bio-toggle"
                      className="hero-bio-close"
                    >
                      关闭
                    </label>
                  </div>
                  <div className="hero-bio-scroll hero-bio-content">
                    <PortableContent value={hero.bio} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border bg-card p-6 hero-panel hero-bio">
              <p className="hero-panel-title text-xs uppercase tracking-[0.2em] text-muted-foreground">
                传记
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                传记正文将在后续阶段完成富文本渲染与段落排版。
              </p>
            </div>
          )}
        </div>

        <aside className="order-2 space-y-6 lg:order-3">
          <div className="rounded-2xl border bg-card p-5 hero-panel hero-meta">
            <p className="hero-panel-title text-xs uppercase tracking-[0.2em] text-muted-foreground">
              角色档案
            </p>
            <div className="mt-4 space-y-3 text-sm">
              {hero.alias && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">别名</span>
                  <span>{hero.alias}</span>
                </div>
              )}
              {hero.age && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">年龄</span>
                  <span>{hero.age}</span>
                </div>
              )}
              {statusLabel && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">状态</span>
                  <span>{statusLabel}</span>
                </div>
              )}
              {hero.faction && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">阵营</span>
                  <span>{hero.faction}</span>
                </div>
              )}
              {hero.roles && hero.roles.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">职业</span>
                  <span>{hero.roles.join(' / ')}</span>
                </div>
              )}
              {hero.signatureWeapon && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">武器</span>
                  <span>{hero.signatureWeapon}</span>
                </div>
              )}
              {hero.motto && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">箴言</span>
                  <span className="text-right">{hero.motto}</span>
                </div>
              )}
              {hero.region?.name && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">区域</span>
                  <Link
                    href={`/regions/${hero.region.slug.current}`}
                    className="text-primary"
                  >
                    {hero.region.name}
                  </Link>
                </div>
              )}
              {hero.country?.name && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">国家</span>
                  <Link
                    href={`/countries/${hero.country.slug.current}`}
                    className="text-primary"
                  >
                    {hero.country.name}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 hero-panel hero-crest">
            <p className="hero-panel-title text-xs uppercase tracking-[0.2em] text-muted-foreground">
              纹章
            </p>
            <div className="mt-4 flex items-center justify-center rounded-xl border bg-muted/40 p-6">
              <div className="h-16 w-16 rounded-full border bg-background" />
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-14 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">短篇故事</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Story Links
          </span>
        </div>
        {relatedStories.length > 0 ? (
          <div className="space-y-6">
            {relatedStories.map((story) => (
              <Link
                key={story._id}
                href={`/stories/${story.slug.current}`}
                className="group relative block overflow-hidden rounded-3xl border bg-card"
              >
                <div className="aspect-[21/6] bg-muted">
                  <Image
                    src={story.coverImage ?? placeholders.story}
                    alt={story.title}
                    width={2100}
                    height={600}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    sizes="100vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Short Story
                  </p>
                  <h3 className="text-2xl font-semibold mt-2">{story.title}</h3>
                  <span className="inline-flex items-center gap-2 mt-4 rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em]">
                    阅读故事 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            暂无关联短篇故事，可在故事条目中建立关联。
          </p>
        )}
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">杂项</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Misc
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {['概念草图', '装备与徽章'].map((label) => (
              <div
                key={label}
                className="rounded-2xl border bg-card overflow-hidden"
              >
                <div className="aspect-[4/3] bg-muted">
                  <Image
                    src={placeholders.region}
                    alt={label}
                    width={960}
                    height={720}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4 text-sm text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">其他英雄</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Others
            </span>
          </div>
          {relatedHeroes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedHeroes.slice(0, 4).map((related) => (
                <Link
                  key={related._id}
                  href={`/champions/${related.slug.current}`}
                  className="group rounded-2xl border bg-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[4/5] bg-muted">
                    <Image
                      src={related.portrait ?? placeholders.hero}
                      alt={related.name}
                      width={960}
                      height={1200}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{related.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              暂无其他英雄可推荐。
            </p>
          )}
        </div>
      </section>

      <RecommendationGrid items={recommendations} />
      </div>
    </div>
  )
}
