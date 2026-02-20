import { getTranslations } from 'next-intl/server'
import { client } from '@/lib/sanity/client'
import { heroesQuery } from '@/lib/sanity/queries'
import { ChampionsFilter } from '@/components/marketing/ChampionsFilter'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import styles from './page.module.css'

type Hero = {
  _id: string
  name: string
  title?: string
  slug: { current: string }
  portrait?: string
  faction?: string
  roles?: string[]
  region?: { name: string; slug: { current: string } }
  country?: { name: string; slug: { current: string } }
}

export default async function ChampionsPage() {
  const t = await getTranslations('ChampionsPage')
  const heroes: Hero[] = await client.fetch(heroesQuery)

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <ScrollReveal as="header" className="max-w-2xl mb-12">
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.lead}>{t('lead')}</p>
      </ScrollReveal>

      {heroes.length === 0 ? (
        <p className={styles.empty}>{t('empty')}</p>
      ) : (
        <ChampionsFilter heroes={heroes} />
      )}
    </div>
  )
}
