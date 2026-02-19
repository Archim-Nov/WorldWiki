import { notFound } from 'next/navigation'
import Image from 'next/image'
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

function elementLabel(element?: MagicDetail['element']) {
  if (element === 'fire') return '火'
  if (element === 'wind') return '风'
  if (element === 'earth') return '土'
  if (element === 'water') return '水'
  return null
}

const difficultyLabels: Record<NonNullable<MagicDetail['difficulty']>, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
  master: '大师',
}

const castTypeLabels: Record<NonNullable<MagicDetail['castType']>, string> = {
  instant: '瞬发',
  channel: '引导',
  ritual: '仪式',
}

const EMPTY_VALUE_TEXT = '未记录'
const EMPTY_RISK_TEXT = '暂无风险记录。'
const EMPTY_MAGIC_DETAILS_TEXT = '暂无详细设定。'

function labelForDifficulty(value?: MagicDetail['difficulty']) {
  if (!value) return EMPTY_VALUE_TEXT
  return difficultyLabels[value] ?? value
}

function labelForCastType(value?: MagicDetail['castType']) {
  if (!value) return EMPTY_VALUE_TEXT
  return castTypeLabels[value] ?? value
}

export default async function MagicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const magic: MagicDetail | null = await client.fetch(magicBySlugQuery, { slug })

  if (!magic) {
    notFound()
  }

  const recommendations: RecommendationItem[] = []
  const seen = new Set<string>()
  const isPrinciple = magic.kind === 'principle'
  const element = elementLabel(magic.element)
  const requirements =
    magic.requirements && magic.requirements.length > 0
      ? magic.requirements.join(' / ')
      : EMPTY_VALUE_TEXT

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
      <section className="rounded-3xl border bg-card overflow-hidden">
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
            {isPrinciple ? '原理' : '法术'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-3">{magic.name}</h1>
          {magic.school ? (
            <p className="text-sm text-muted-foreground mt-2">{magic.school}</p>
          ) : null}
          {!isPrinciple && element ? (
            <p className="text-sm text-muted-foreground mt-1">元素：{element}</p>
          ) : null}
          {magic.summary ? (
            <p className="text-muted-foreground mt-4">{magic.summary}</p>
          ) : null}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">施放档案</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            参数
          </span>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <span className="text-muted-foreground">难度</span>
            <span>{labelForDifficulty(magic.difficulty)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <span className="text-muted-foreground">施放方式</span>
            <span>{labelForCastType(magic.castType)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <span className="text-muted-foreground">法力消耗</span>
            <span>{magic.manaCost ?? EMPTY_VALUE_TEXT}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <span className="text-muted-foreground">冷却时间</span>
            <span>{magic.cooldown ?? EMPTY_VALUE_TEXT}</span>
          </div>
          <div className="rounded-xl border p-3 sm:col-span-2">
            <p className="text-muted-foreground">前置条件</p>
            <p className="mt-1">{requirements}</p>
          </div>
          <div className="rounded-xl border p-3 sm:col-span-2">
            <p className="text-muted-foreground">风险说明</p>
            <p className="mt-1">{magic.risks ?? EMPTY_RISK_TEXT}</p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-1 rounded-full bg-primary/70" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              详情
            </p>
            <h2 className="text-xl font-semibold">
              {isPrinciple ? '原理设定' : '法术设定'}
            </h2>
          </div>
        </div>
        {magic.details && magic.details.length > 0 ? (
          <div className="mt-4">
            <PortableContent value={magic.details} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">
            {isPrinciple
              ? `原理：${EMPTY_MAGIC_DETAILS_TEXT}`
              : `法术：${EMPTY_MAGIC_DETAILS_TEXT}`}
          </p>
        )}
      </section>

      <RecommendationGrid items={recommendations} />
    </div>
  )
}
