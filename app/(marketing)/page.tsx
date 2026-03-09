import { unstable_cache } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { client } from '@/lib/sanity/client'
import { homePageQuery } from '@/lib/sanity/queries'
import { toRecommendation } from '@/lib/recommendations'
import { CenteredCarousel } from '@/components/marketing/CenteredCarousel'
import { FullscreenHero } from '@/components/marketing/FullscreenHero'
import { RandomShowcase } from '@/components/marketing/RandomShowcase'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import styles from './page.module.css'

type RawItem = {
  _id?: string
  _type?: 'hero' | 'region' | 'country' | 'creature' | 'story' | 'magic'
  slug?: { current: string }
  title?: string
  name?: string
  portrait?: string
  mapImage?: string
  coverImage?: string
}

type HomePageQueryResult = {
  randomPool: RawItem[]
  latestHeroes: RawItem[]
  latestCountries: RawItem[]
  latestDetails: RawItem[]
}

const getHomePageData = unstable_cache(
  async () => client.fetch<HomePageQueryResult>(homePageQuery),
  ['home-page-data'],
  {
    revalidate: 300,
    tags: ['home-page'],
  }
)

export default async function HomePage() {
  const t = await getTranslations('HomePage')

  const { randomPool, latestHeroes, latestCountries, latestDetails } =
    await getHomePageData()

  const localizeTypeLabel = (href: string, fallback: string) => {
    if (href.startsWith('/champions/')) return t('types.hero')
    if (href.startsWith('/regions/')) return t('types.region')
    if (href.startsWith('/countries/')) return t('types.country')
    if (href.startsWith('/creatures/')) return t('types.creature')
    if (href.startsWith('/stories/')) return t('types.story')
    if (href.startsWith('/magics/')) return t('types.magic')
    return fallback
  }

  const allRandomCards = randomPool
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      ...item,
      typeLabel: localizeTypeLabel(item.href, item.typeLabel),
    }))

  const heroCards = latestHeroes
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      ...item,
      typeLabel: localizeTypeLabel(item.href, item.typeLabel),
    }))

  const countryCards = latestCountries
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      ...item,
      typeLabel: localizeTypeLabel(item.href, item.typeLabel),
    }))

  const latestDetailCards = latestDetails
    .map((item) => toRecommendation(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      ...item,
      typeLabel: localizeTypeLabel(item.href, item.typeLabel),
    }))

  return (
    <div className={styles.page}>
      {latestDetailCards.length > 0 ? (
        <FullscreenHero items={latestDetailCards} />
      ) : null}

      <div className="container mx-auto px-4 py-12 sm:py-16">
        <ScrollReveal as="section" className="max-w-3xl mx-auto text-center mt-16">
          <p
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            {t('kicker')}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-4 mb-4">{t('title')}</h1>
          <p className="text-base sm:text-lg text-muted-foreground">{t('description')}</p>
        </ScrollReveal>

        {allRandomCards.length > 0 ? (
          <RandomShowcase items={allRandomCards} />
        ) : (
          <section className="mt-16 sm:mt-20">
            <p className="text-sm text-muted-foreground">{t('randomEmpty')}</p>
          </section>
        )}
      </div>

      <ScrollReveal className="mt-24">
        <div className="ornament mb-6">
          <span className="ornament-symbol">&#x2726;</span>
        </div>
      </ScrollReveal>

      <section className="mt-12">
        <ScrollReveal className="text-center mb-10">
          <p
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            {t('championsKicker')}
          </p>
          <h2 className="text-2xl font-semibold">{t('championsTitle')}</h2>
        </ScrollReveal>
        {heroCards.length > 0 ? (
          <CenteredCarousel items={heroCards} />
        ) : (
          <p className="container mx-auto px-4 text-sm text-muted-foreground">
            {t('championsEmpty')}
          </p>
        )}
      </section>

      <ScrollReveal className="mt-24">
        <div className="ornament mb-6">
          <span className="ornament-symbol">&#x2726;</span>
        </div>
      </ScrollReveal>

      <section className="mt-12 pb-24">
        <ScrollReveal className="text-center mb-10">
          <p
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            {t('countriesKicker')}
          </p>
          <h2 className="text-2xl font-semibold">{t('countriesTitle')}</h2>
        </ScrollReveal>
        {countryCards.length > 0 ? (
          <CenteredCarousel items={countryCards} />
        ) : (
          <p className="container mx-auto px-4 text-sm text-muted-foreground">
            {t('countriesEmpty')}
          </p>
        )}
      </section>
    </div>
  )
}
