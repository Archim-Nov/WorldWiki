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
  const heroes: Hero[] = await client.fetch(heroesQuery)

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <ScrollReveal as="header" className="max-w-2xl mb-12">
        <p className={styles.eyebrow}>
          Champions
        </p>
        <h1 className={styles.title}>英雄画廊</h1>
        <p className={styles.lead}>
          每一位英雄都是一幅展品，选择你感兴趣的角色进入传记。
        </p>
      </ScrollReveal>

      {heroes.length === 0 ? (
        <p className={styles.empty}>
          暂无英雄内容，请先在 Studio 中创建。
        </p>
      ) : (
        <ChampionsFilter heroes={heroes} />
      )}
    </div>
  )
}
