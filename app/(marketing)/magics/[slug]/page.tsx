import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { client } from '@/lib/sanity/client'
import { magicBySlugQuery } from '@/lib/sanity/queries'
import { placeholders } from '@/lib/placeholders'
import { PortableContent } from '@/components/portable/PortableContent'
import { RecommendationGrid } from '@/components/marketing/RecommendationGrid'
import {
  addRecommendations,
  type RecommendationItem,
  type RecommendationSource,
} from '@/lib/recommendations'

type MagicDetail = {
  _id: string
  name: string
  kind?: 'principle' | 'spell'
  element?: 'fire' | 'wind' | 'earth' | 'water'
  school?: string
  summary?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master'
  castType?: 'instant' | 'channel' | 'ritual'
  manaCost?: string
  cooldown?: string
  requirements?: string[]
  risks?: string
  coverImage?: string
  details?: unknown[]
  relatedHeroes?: Array<{
    _id: string
    name: string
    slug: { current: string }
    portrait?: string
  }>
  relatedStories?: Array<{
    _id: string
    title: string
    slug: { current: string }
    coverImage?: string
  }>
  linkedRefs?: RecommendationSource[]
}

function elementLabel(element: MagicDetail['element'] | undefined, t: (key: string) => string) {
  if (!element) return null
  return t(`elements.${element}`)
}

function labelForDifficulty(
  value: MagicDetail['difficulty'] | undefined,
  t: (key: string) => string,
  emptyValue: string
) {
  if (!value) return emptyValue
  return t(`difficultyLabels.${value}`)
}

function labelForCastType(
  value: MagicDetail['castType'] | undefined,
  t: (key: string) => string,
  emptyValue: string
) {
  if (!value) return emptyValue
  return t(`castTypeLabels.${value}`)
}

export default async function MagicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const t = await getTranslations('MagicDetailPage')
  const { slug } = await params
  const magic: MagicDetail | null = await client.fetch(magicBySlugQuery, { slug })

  if (!magic) {
    notFound()
  }

  const emptyValue = t('emptyValue')
  const recommendations: RecommendationItem[] = []
  const seen = new Set<string>()
  const isPrinciple = magic.kind === 'principle'
  const element = elementLabel(magic.element, t)
  const requirements =
    magic.requirements && magic.requirements.length > 0
      ? magic.requirements.join(' / ')
      : emptyValue

  addRecommendations(recommendations, seen, magic.relatedHeroes ?? [], 'hero')
  addRecommendations(recommendations, seen, magic.relatedStories ?? [], 'story')
  addRecommendations(recommendations, seen, magic.linkedRefs ?? [])

  if (recommendations.length < 3) {
    const excludeIds = Array.from(seen)
    const fallback: RecommendationSource[] = await client.fetch(
      `*[_type in ["hero","region","country","creature","story","magic"] && !(_id in $excludeIds)] | order(_updatedAt desc)[0..10] {
        _id,
        _type,
        title,
        name,
        slug,
        "portrait": portrait.asset->url,
        "mapImage": mapImage.asset->url,
        "coverImage": coverImage.asset->url
      }`,
      { excludeIds }
    )
    addRecommendations(recommendations, seen, fallback)
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <section className="overflow-hidden rounded-3xl border bg-card">
        <div className="aspect-[16/7] bg-muted">
          <Image
            src={magic.coverImage ?? placeholders.magic}
            alt={magic.name}
            width={1920}
            height={840}
            className="h-full w-full object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {isPrinciple ? t('principle') : t('spell')}
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{magic.name}</h1>
          {magic.school ? <p className="mt-2 text-sm text-muted-foreground">{magic.school}</p> : null}
          {!isPrinciple && element ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {t('elementWithValue', { element })}
            </p>
          ) : null}
          {magic.summary ? <p className="mt-4 text-muted-foreground">{magic.summary}</p> : null}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('archiveTitle')}</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('params')}</span>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <span className="text-muted-foreground">{t('fields.difficulty')}</span>
            <span>{labelForDifficulty(magic.difficulty, t, emptyValue)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <span className="text-muted-foreground">{t('fields.castType')}</span>
            <span>{labelForCastType(magic.castType, t, emptyValue)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <span className="text-muted-foreground">{t('fields.manaCost')}</span>
            <span>{magic.manaCost ?? emptyValue}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <span className="text-muted-foreground">{t('fields.cooldown')}</span>
            <span>{magic.cooldown ?? emptyValue}</span>
          </div>
          <div className="rounded-xl border p-3 sm:col-span-2">
            <p className="text-muted-foreground">{t('fields.requirements')}</p>
            <p className="mt-1">{requirements}</p>
          </div>
          <div className="rounded-xl border p-3 sm:col-span-2">
            <p className="text-muted-foreground">{t('fields.risks')}</p>
            <p className="mt-1">{magic.risks ?? t('emptyRisk')}</p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-1 rounded-full bg-primary/70" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('detailKicker')}</p>
            <h2 className="text-xl font-semibold">
              {isPrinciple ? t('principleDetailTitle') : t('spellDetailTitle')}
            </h2>
          </div>
        </div>
        {magic.details && magic.details.length > 0 ? (
          <div className="mt-4">
            <PortableContent value={magic.details} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {isPrinciple ? t('emptyDetailsPrinciple') : t('emptyDetailsSpell')}
          </p>
        )}
      </section>

      <RecommendationGrid items={recommendations} />
    </div>
  )
}
