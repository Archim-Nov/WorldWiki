import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { client } from '@/lib/sanity/client'
import { RecommendationItem, toRecommendation } from '@/lib/recommendations'
import { CenteredCarousel } from '@/components/marketing/CenteredCarousel'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type RawItem = {
  _id?: string
  _type?: 'hero' | 'region' | 'country' | 'creature' | 'story'
  slug?: { current: string }
  title?: string
  name?: string
  portrait?: string
  mapImage?: string
  coverImage?: string
}

const randomPoolQuery = `*[_type in ["country","region","creature","hero","story"]][0..60] {
  _id,
  _type,
  title,
  name,
  slug,
  "portrait": portrait.asset->url,
  "mapImage": mapImage.asset->url,
  "coverImage": coverImage.asset->url
}`

const latestHeroesQuery = `*[_type == "hero"] | order(_updatedAt desc)[0..4] {
  _id,
  _type,
  name,
  title,
  slug,
  "portrait": portrait.asset->url
}`

const latestDetailsQuery = `*[_type in ["country","region","creature","hero"]] | order(_updatedAt desc)[0..4] {
  _id,
  _type,
  name,
  title,
  slug,
  "portrait": portrait.asset->url,
  "mapImage": mapImage.asset->url
}`

const latestCountriesQuery = `*[_type == "country"] | order(_updatedAt desc)[0..4] {
  _id,
  _type,
  name,
  slug,
  "mapImage": mapImage.asset->url
}`

function shuffle<T>(items: T[]) {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export default async function HomePage() {
  noStore()

  const [randomPool, latestHeroes, latestCountries, latestDetails] =
    await Promise.all([
    client.fetch<RawItem[]>(randomPoolQuery),
    client.fetch<RawItem[]>(latestHeroesQuery),
    client.fetch<RawItem[]>(latestCountriesQuery),
    client.fetch<RawItem[]>(latestDetailsQuery),
  ])

  const randomCards = shuffle(
    randomPool
      .map((item) => toRecommendation(item))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  ).slice(0, 5)

  const heroCards = latestHeroes
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const countryCards = latestCountries
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const latestDetailCards = latestDetails
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const renderLargeCard = (card: RecommendationItem) => (
    <Link
      href={card.href}
      className="group relative overflow-hidden rounded-3xl border bg-card"
    >
      <div className="h-[280px] sm:h-[360px] lg:h-[460px] bg-muted">
        <img
          src={card.image}
          alt={card.title}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <div className="text-xs uppercase tracking-[0.3em] text-white/70">
          {card.typeLabel}
        </div>
        <h3 className="text-2xl sm:text-3xl font-semibold mt-2">
          {card.title}
        </h3>
      </div>
    </Link>
  )

  const renderSmallCard = (card: RecommendationItem) => (
    <Link
      key={card._id}
      href={card.href}
      className="group rounded-3xl border bg-card overflow-hidden"
    >
      <div className="h-[160px] sm:h-[200px] bg-muted">
        <img
          src={card.image}
          alt={card.title}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className="p-4 sm:p-5">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {card.typeLabel}
        </div>
        <h4 className="text-lg font-semibold mt-2">{card.title}</h4>
      </div>
    </Link>
  )

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">最新详情</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Latest Details
          </span>
        </div>
        {latestDetailCards.length > 0 ? (
          <CenteredCarousel
            items={latestDetailCards}
            className="home-carousel--latest"
          />
        ) : (
          <p className="text-sm text-muted-foreground">暂无最新详情。</p>
        )}
      </section>

      <section className="max-w-3xl mt-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Museum Universe
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold mt-4 mb-4">
          以详情为入口，开启探索
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          随机展柜展示当下的内容切片，最新英雄与国家条目固定陈列，
          进入后直接阅读详情与关联。
        </p>
      </section>

      <section className="mt-10 sm:mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">随机展柜</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Random Details
          </span>
        </div>
        {randomCards.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="order-1">{renderLargeCard(randomCards[0])}</div>
            <div className="order-2 grid gap-6 sm:grid-cols-2">
              {randomCards.slice(1, 5).map(renderSmallCard)}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            暂无内容可展示。
          </p>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">最新英雄</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Latest Heroes
          </span>
        </div>
        {heroCards.length > 0 ? (
          <CenteredCarousel items={heroCards} />
        ) : (
          <p className="text-sm text-muted-foreground">暂无英雄内容。</p>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">最新国家</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Latest Countries
          </span>
        </div>
        {countryCards.length > 0 ? (
          <CenteredCarousel items={countryCards} />
        ) : (
          <p className="text-sm text-muted-foreground">暂无国家内容。</p>
        )}
      </section>
    </div>
  )
}
