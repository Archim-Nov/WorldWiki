import Image from 'next/image'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import { placeholders } from '@/lib/placeholders'
import { client } from '@/lib/sanity/client'
import { storiesQuery } from '@/lib/sanity/queries'
import { withLocalePrefix } from '@/i18n/path'
import styles from './page.module.css'

type Story = {
  _id: string
  title: string
  slug: { current: string }
  coverImage?: string
  content?: Array<{
    _type?: string
    children?: Array<{
      _type?: string
      text?: string
    }>
  }>
}

function extractStorySummary(story: Story, fallbackSummary: string): string {
  if (!story.content) {
    return fallbackSummary
  }

  for (const block of story.content) {
    if (block?._type !== 'block' || !block.children) {
      continue
    }

    const text = block.children
      .map((child) => (typeof child.text === 'string' ? child.text : ''))
      .join('')
      .replace(/\s+/g, ' ')
      .trim()

    if (text.length > 0) {
      return text.length > 68 ? `${text.slice(0, 68)}...` : text
    }
  }

  return fallbackSummary
}

export default async function StoriesPage() {
  const locale = await getLocale()
  const t = await getTranslations('StoriesPage')
  const stories: Story[] = await client.fetch(storiesQuery)
  const fallbackSummary = t('defaultSummary')

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <ScrollReveal as="header" className="max-w-2xl mb-12">
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.lead}>{t('lead')}</p>
      </ScrollReveal>

      {stories.length === 0 ? (
        <p className={styles.empty}>{t('empty')}</p>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {stories.map((story, i) => (
            <Link
              key={story._id}
              href={withLocalePrefix(`/stories/${story.slug.current}`, locale)}
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
                  <p className={styles.cardSummary}>{extractStorySummary(story, fallbackSummary)}</p>
                </div>
                <div className={styles.cardCta}>
                  {t('read')} {'>'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
