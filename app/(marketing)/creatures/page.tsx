import { getTranslations } from 'next-intl/server'
import { client } from '@/lib/sanity/client'
import { creaturesQuery } from '@/lib/sanity/queries'
import { CreaturesFilter } from '@/components/marketing/CreaturesFilter'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import styles from './page.module.css'

type Creature = {
  _id: string
  name: string
  slug: { current: string }
  species?: string
  portrait?: string
  category?: string
  region?: { name: string; slug: { current: string } }
}

export default async function CreaturesPage() {
  const t = await getTranslations('CreaturesPage')
  const creatures: Creature[] = await client.fetch(creaturesQuery)

  return (
    <div className={styles.page}>
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <ScrollReveal as="header" className="max-w-2xl mb-12">
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.lead}>{t('lead')}</p>
        </ScrollReveal>

        {creatures.length === 0 ? (
          <p className={styles.empty}>{t('empty')}</p>
        ) : (
          <CreaturesFilter creatures={creatures} />
        )}
      </div>
    </div>
  )
}
