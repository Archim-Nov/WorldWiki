import { getTranslations } from 'next-intl/server'
import { client } from '@/lib/sanity/client'
import { magicsQuery } from '@/lib/sanity/queries'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import { MagicsFilterSection } from './MagicsFilterSection'
import styles from './page.module.css'

type MagicKind = 'principle' | 'spell'
type MagicFilter = 'all' | MagicKind
type MagicElement = 'fire' | 'wind' | 'earth' | 'water'

type Magic = {
  _id: string
  name: string
  slug: { current: string }
  kind?: MagicKind
  element?: MagicElement
  school?: string
  summary?: string
  coverImage?: string
}

function normalizeMagicFilter(raw?: string): MagicFilter {
  if (raw === 'principle' || raw === 'spell') {
    return raw
  }
  return 'all'
}

export default async function MagicsPage({
  searchParams,
}: {
  searchParams?: Promise<{ kind?: string }>
} = {}) {
  const t = await getTranslations('MagicsPage')
  const magics: Magic[] = await client.fetch(magicsQuery)
  const resolvedSearchParams = (await searchParams) ?? {}
  const initialFilter = normalizeMagicFilter(resolvedSearchParams.kind)

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <ScrollReveal as="header" className="mb-12 max-w-2xl">
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.lead}>{t('lead')}</p>
      </ScrollReveal>

      {magics.length === 0 ? (
        <p className={styles.empty}>{t('empty')}</p>
      ) : (
        <MagicsFilterSection magics={magics} initialFilter={initialFilter} />
      )}
    </div>
  )
}
