import Image from 'next/image'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import { placeholders } from '@/lib/placeholders'
import { client } from '@/lib/sanity/client'
import { regionsQuery } from '@/lib/sanity/queries'
import { withLocalePrefix } from '@/i18n/path'
import styles from './page.module.css'

type Region = {
  _id: string
  name: string
  slug: { current: string }
  summary?: string
  mapImage?: string
  country?: { name: string; slug: { current: string } }
}

export default async function RegionsPage() {
  const locale = await getLocale()
  const t = await getTranslations('RegionsPage')
  const regions: Region[] = await client.fetch(regionsQuery)

  return (
    <div className={styles.page}>
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <ScrollReveal as="header" className="max-w-2xl mb-12">
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.lead}>{t('lead')}</p>
        </ScrollReveal>

        {regions.length === 0 ? (
          <p className={styles.empty}>{t('empty')}</p>
        ) : (
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <Link
                key={region._id}
                href={withLocalePrefix(`/regions/${region.slug.current}`, locale)}
                className={styles.card}
              >
                <div className={`aspect-[4/3] ${styles.cardMedia}`}>
                  <Image
                    src={region.mapImage ?? placeholders.region}
                    alt={region.name}
                    width={1200}
                    height={900}
                    className={styles.cardImage}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className={styles.cardOverlay} />
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{region.name}</h2>
                  {region.country?.name ? <p className={styles.cardMeta}>{region.country.name}</p> : null}
                  {region.summary ? <p className={styles.cardSummary}>{region.summary}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
