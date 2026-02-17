import { client } from '@/lib/sanity/client'
import { magicsQuery } from '@/lib/sanity/queries'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import { MagicsFilterSection } from './MagicsFilterSection'

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
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <ScrollReveal as="header" className="max-w-2xl mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Magic
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold mt-4">魔法图鉴</h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-4">
          将魔法拆分为「原理」与「法术」两条主线，分别理解世界观规则与实战应用。
        </p>
      </ScrollReveal>

      {magics.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          暂无魔法内容，请先在 Studio 中创建。
        </p>
      ) : (
        <MagicsFilterSection magics={magics} initialFilter={initialFilter} />
      )}
    </div>
  )
}
