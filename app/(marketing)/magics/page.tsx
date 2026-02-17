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
  const magics: Magic[] = await client.fetch(magicsQuery)
  const resolvedSearchParams = (await searchParams) ?? {}
  const initialFilter = normalizeMagicFilter(resolvedSearchParams.kind)

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <ScrollReveal as="header" className="mb-12 max-w-2xl">
        <p className={styles.eyebrow}>Magic</p>
        <h1 className={styles.title}>魔法图鉴</h1>
        <p className={styles.lead}>
          将魔法拆分为「原理」与「法术」两条主线，分别理解世界观规则与实战应用。
        </p>
      </ScrollReveal>

      {magics.length === 0 ? (
        <p className={styles.empty}>暂无魔法内容，请先在 Studio 中创建。</p>
      ) : (
        <MagicsFilterSection magics={magics} initialFilter={initialFilter} />
      )}
    </div>
  )
}
