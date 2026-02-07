import { unstable_noStore as noStore } from 'next/cache'
import { client } from '@/lib/sanity/client'
import { toRecommendation } from '@/lib/recommendations'
import { CenteredCarousel } from '@/components/marketing/CenteredCarousel'
import { FullscreenHero } from '@/components/marketing/FullscreenHero'
import { RandomShowcase } from '@/components/marketing/RandomShowcase'
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

export default async function HomePage() {
  noStore()

  const [randomPool, latestHeroes, latestCountries, latestDetails] =
    await Promise.all([
    client.fetch<RawItem[]>(randomPoolQuery),
    client.fetch<RawItem[]>(latestHeroesQuery),
    client.fetch<RawItem[]>(latestCountriesQuery),
    client.fetch<RawItem[]>(latestDetailsQuery),
  ])

  const allRandomCards = randomPool
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const heroCards = latestHeroes
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const countryCards = latestCountries
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const latestDetailCards = latestDetails
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
    <div className={styles.page}>
      {latestDetailCards.length > 0 ? (
        <FullscreenHero items={latestDetailCards} />
      ) : null}

      <div className="container mx-auto px-4 py-12 sm:py-16">

      <section className="max-w-3xl mx-auto text-center mt-16">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
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

      {allRandomCards.length > 0 ? (
          <RandomShowcase items={allRandomCards} />
        ) : (
          <section className="mt-16 sm:mt-20">
            <p className="text-sm text-muted-foreground">暂无内容可展示。</p>
          </section>
        )}
      </div>

      <section className="mt-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold">英雄</h2>
        </div>
        {heroCards.length > 0 ? (
          <CenteredCarousel items={heroCards} />
        ) : (
          <p className="container mx-auto px-4 text-sm text-muted-foreground">暂无英雄内容。</p>
        )}
      </section>

      <section className="mt-24 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold">国家</h2>
        </div>
        {countryCards.length > 0 ? (
          <CenteredCarousel items={countryCards} />
        ) : (
          <p className="container mx-auto px-4 text-sm text-muted-foreground">暂无国家内容。</p>
        )}
      </section>
    </div>
  )
}
