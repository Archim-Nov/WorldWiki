import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { countriesQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
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
      <header className="max-w-2xl mb-12">
        <p className={styles.eyebrow}>Countries</p>
        <h1 className={styles.title}>国家画廊</h1>
        <p className={styles.lead}>
          以宏观地理为起点，进入世界的版块与文明。
        </p>
      </header>

      {countries.length === 0 ? (
        <p className={styles.empty}>
          暂无国家内容，请先在 Studio 中创建。
        </p>
      ) : (
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {countries.map((country) => (
            <Link
              key={country._id}
              href={`/countries/${country.slug.current}`}
              className={styles.card}
            >
              <div className={`aspect-[16/9] ${styles.cardMedia}`}>
                <img
                  src={country.mapImage ?? placeholders.country}
                  alt={country.name}
                  className={styles.cardImage}
                  loading="lazy"
                />
                <div className={styles.cardOverlay} />
                <div className={styles.cardTitleWrap}>
                  <h2 className={styles.cardTitle}>{country.name}</h2>
                </div>
              </div>
              <div className={styles.cardBody}>
                {country.summary && (
                  <p className={styles.cardSummary}>{country.summary}</p>
                )}
                <div className={styles.cardCta}>进入国家 →</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
