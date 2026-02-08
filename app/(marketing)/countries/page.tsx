import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { countriesQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import styles from './page.module.css'

type Country = {
  _id: string
  name: string
  slug: { current: string }
  summary?: string
  mapImage?: string
}

export default async function CountriesPage() {
  const countries: Country[] = await client.fetch(countriesQuery)

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <ScrollReveal as="header" className="max-w-2xl mb-14">
        <p className={styles.eyebrow}>Countries</p>
        <h1 className={styles.title}>国家画廊</h1>
        <p className={styles.lead}>
          以宏观地理为起点，进入世界的版块与文明。
        </p>
      </ScrollReveal>

      {countries.length === 0 ? (
        <p className={styles.empty}>
          暂无国家内容，请先在 Studio 中创建。
        </p>
      ) : (
        <div className="space-y-6">
          {countries.map((country, i) => (
            <Link
              key={country._id}
              href={`/countries/${country.slug.current}`}
              className={styles.card}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardBg}>
                  <img
                    src={country.mapImage ?? placeholders.country}
                    alt={country.name}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                </div>
                <div className={styles.cardOverlay} />
                <span className={styles.cardIndex}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardName}>{country.name}</h2>
                  {country.summary && (
                    <p className={styles.cardSummary}>{country.summary}</p>
                  )}
                  <div className={styles.cardFooter}>
                    <span className={styles.cardCta}>探索国家</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
