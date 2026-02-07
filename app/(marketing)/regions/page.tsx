import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { regionsQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
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
  const regions: Region[] = await client.fetch(regionsQuery)

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <header className="max-w-2xl mb-12">
        <p className={styles.eyebrow}>Regions</p>
        <h1 className={styles.title}>区域画廊</h1>
        <p className={styles.lead}>
          以地图与场景为线索，进入每一块世界碎片。
        </p>
      </header>

      {regions.length === 0 ? (
        <p className={styles.empty}>
          暂无区域内容，请先在 Studio 中创建。
        </p>
      ) : (
        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => (
            <Link
              key={region._id}
              href={`/regions/${region.slug.current}`}
              className={styles.card}
            >
              <div className={`aspect-[4/3] ${styles.cardMedia}`}>
                <img
                  src={region.mapImage ?? placeholders.region}
                  alt={region.name}
                  className={styles.cardImage}
                  loading="lazy"
                />
              </div>
              <div className={styles.cardOverlay} />
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{region.name}</h2>
                {region.country?.name && (
                  <p className={styles.cardMeta}>{region.country.name}</p>
                )}
                {region.summary && (
                  <p className={styles.cardSummary}>{region.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
