import Image from 'next/image'
import Link from 'next/link'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import { placeholders } from '@/lib/placeholders'
import { client } from '@/lib/sanity/client'
import { storiesQuery } from '@/lib/sanity/queries'
import styles from './page.module.css'

type Story = {
  _id: string
  title: string
  slug: { current: string }
  coverImage?: string
}

export default async function StoriesPage() {
  const stories: Story[] = await client.fetch(storiesQuery)

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <ScrollReveal as="header" className="max-w-2xl mb-12">
        <p className={styles.eyebrow}>Stories</p>
        <h1 className={styles.title}>故事画廊</h1>
        <p className={styles.lead}>以小说与短篇链接世界的情绪与线索。</p>
      </ScrollReveal>

      {stories.length === 0 ? (
        <p className={styles.empty}>暂无故事内容，请先在 Studio 中创建。</p>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {stories.map((story, i) => (
            <Link
              key={story._id}
              href={`/stories/${story.slug.current}`}
              className={`${styles.card} flex flex-col md:flex-row`}
              style={{ '--story-index': `"${String(i + 1).padStart(2, '0')}"` } as React.CSSProperties}
            >
              <div className={`aspect-[16/9] md:aspect-[4/5] md:w-48 ${styles.cardMedia}`}>
                <Image
                  src={story.coverImage ?? placeholders.story}
                  alt={story.title}
                  width={960}
                  height={1200}
                  className={styles.cardImage}
                  sizes="(max-width: 768px) 100vw, 192px"
                />
              </div>
              <div className={styles.cardBody}>
                <div>
                  <h2 className={styles.cardTitle}>{story.title}</h2>
                  <p className={styles.cardSummary}>进入故事章节，沿着线索连接世界的其他入口。</p>
                </div>
                <div className={styles.cardCta}>开始阅读 {'>'}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

