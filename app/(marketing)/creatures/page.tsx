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
  const creatures: Creature[] = await client.fetch(creaturesQuery)

  return (
    <div className={styles.page}>
      <div className="container mx-auto px-4 py-12 sm:py-16">
      <ScrollReveal as="header" className="max-w-2xl mb-12">
        <p className={styles.eyebrow}>Creatures</p>
        <h1 className={styles.title}>生物画廊</h1>
        <p className={styles.lead}>
          记录这个世界里的物种与生态切面。
        </p>
      </ScrollReveal>

      {creatures.length === 0 ? (
        <p className={styles.empty}>
          暂无生物内容，请先在 Studio 中创建。
        </p>
      ) : (
        <CreaturesFilter creatures={creatures} />
      )}
      </div>
    </div>
  )
}

