import type {
  WriterConceptCard,
  WriterConceptDecision,
  WriterDocumentType,
  WriterOutlineBlock,
  WriterSchemaSummary,
  WriterStage,
  WriterTypeSuggestion,
  WriterWorkflowMode,
} from '@/types/writer'
import { createTimestamp, createWriterId } from '@/lib/writer/utils'

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function uniqueStrings(values: unknown[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = cleanString(value)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }

  return result
}

function normalizeTypeSuggestions(value: unknown, fallback: WriterTypeSuggestion[]) {
  if (!Array.isArray(value)) return fallback

  const suggestions = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const documentType = cleanString(record.documentType) as WriterDocumentType
      const score = typeof record.score === 'number' ? record.score : 0
      const reason = cleanString(record.reason)

      if (!documentType) return null
      return {
        documentType,
        score,
        reason: reason || '由 AI 对话推断。',
      }
    })
    .filter(Boolean) as WriterTypeSuggestion[]

  return suggestions.length > 0 ? suggestions : fallback
}

function toDecisionArray(value: unknown) {
  if (!Array.isArray(value)) return [] as WriterConceptDecision[]

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const label = cleanString(record.label)
      const decisionValue = cleanString(record.value)
      if (!label || !decisionValue) return null

      return {
        id: cleanString(record.id) || createWriterId('decision'),
        label,
        value: decisionValue,
        locked: Boolean(record.locked),
        source: record.source === 'user' ? 'user' : 'assistant',
      } satisfies WriterConceptDecision
    })
    .filter(Boolean) as WriterConceptDecision[]
}

function mergeDecisions(current: WriterConceptDecision[], incoming: unknown) {
  const next = new Map<string, WriterConceptDecision>()

  for (const decision of current) {
    next.set(decision.label, decision)
  }

  for (const decision of toDecisionArray(incoming)) {
    const existing = next.get(decision.label)
    next.set(decision.label, {
      ...existing,
      ...decision,
      id: existing?.id ?? decision.id,
      locked: existing?.locked || decision.locked,
    })
  }

  return Array.from(next.values())
}

function normalizeOutlineBlocks(value: unknown): WriterOutlineBlock[] {
  if (!Array.isArray(value)) return [] as WriterOutlineBlock[]

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const title = cleanString(record.title)
      const summary = cleanString(record.summary)
      if (!title || !summary) return null

      const mappedFields = Array.isArray(record.mappedFields)
        ? uniqueStrings(record.mappedFields)
        : []

      const status =
        record.status === 'accepted' || record.status === 'expanded' ? record.status : 'pending'

      return {
        id: cleanString(record.id) || createWriterId('outline'),
        title,
        summary,
        mappedFields,
        status,
      } satisfies WriterOutlineBlock
    })
    .filter(Boolean) as WriterOutlineBlock[]
}

export function getInitialWriterStage(workflowMode: WriterWorkflowMode | undefined): WriterStage {
  return workflowMode === 'conversation' ? 'conversation' : 'drafting'
}

export function getWriterStageLabel(stage: WriterStage | undefined) {
  switch (stage) {
    case 'conversation':
      return '概念对话'
    case 'outline':
      return '雏形整理'
    case 'drafting':
      return '结构化起草'
    case 'calibration':
      return 'AI 校准'
    case 'review':
      return '人工核验'
    case 'submitted':
      return '已提交'
    default:
      return '未开始'
  }
}

export function createConceptCard(args: {
  title?: string
  sourceText?: string
  documentType?: WriterDocumentType
  suggestions?: WriterTypeSuggestion[]
}): WriterConceptCard {
  const premise = cleanString(args.sourceText) || cleanString(args.title)
  const fallbackTypes = args.suggestions ?? []
  const candidateTypes =
    fallbackTypes.length > 0
      ? fallbackTypes
      : args.documentType
        ? [
            {
              documentType: args.documentType,
              score: 1,
              reason: '来自当前会话类型。',
            },
          ]
        : []

  return {
    premise,
    goals: [],
    constraints: [],
    candidateTypes,
    openQuestions: premise ? ['这个概念最重要的亮点是什么？'] : ['你想先从什么概念开始？'],
    decisions: [],
    updatedAt: createTimestamp(),
  }
}

export function mergeConceptCard(
  current: WriterConceptCard,
  patch: Partial<WriterConceptCard> | undefined,
  fallbackTypes: WriterTypeSuggestion[]
): WriterConceptCard {
  const nextPatch = patch ?? {}

  return {
    premise: cleanString(nextPatch.premise) || current.premise,
    tone: cleanString(nextPatch.tone) || current.tone,
    goals: uniqueStrings([...(current.goals ?? []), ...((nextPatch.goals as unknown[]) ?? [])]),
    constraints: uniqueStrings([...(current.constraints ?? []), ...((nextPatch.constraints as unknown[]) ?? [])]),
    candidateTypes: normalizeTypeSuggestions(
      nextPatch.candidateTypes,
      current.candidateTypes.length > 0 ? current.candidateTypes : fallbackTypes
    ),
    openQuestions: uniqueStrings([...(current.openQuestions ?? []), ...((nextPatch.openQuestions as unknown[]) ?? [])]).slice(0, 6),
    decisions: mergeDecisions(current.decisions, nextPatch.decisions),
    updatedAt: createTimestamp(),
  }
}

export function createOutlineFromConceptCard(args: {
  conceptCard?: WriterConceptCard
  schema: WriterSchemaSummary
}): WriterOutlineBlock[] {
  const { conceptCard, schema } = args
  const goalText = conceptCard?.goals.slice(0, 2).join('；') || '建立清晰、可信且便于后续展开的条目骨架。'
  const decisionText = conceptCard?.decisions
    .slice(0, 3)
    .map((decision) => `${decision.label}：${decision.value}`)
    .join('；')

  const blocks = schema.groups.slice(0, 4).map((group, index) => {
    const fieldTitles = group.fieldNames
      .map((fieldName) => schema.fields.find((field) => field.name === fieldName)?.title ?? fieldName)
      .join('、')

    let summary = `围绕“${group.title}”整理与 ${fieldTitles} 相关的关键信息。`
    if (index === 0 && conceptCard?.premise) {
      summary = `先建立条目核心概念：${conceptCard.premise}`
    } else if (index === 1 && goalText) {
      summary = `补足该条目在世界观中的功能与重点：${goalText}`
    } else if (index === 2 && decisionText) {
      summary = `把已经确认的设定沉淀到结构层：${decisionText}`
    }

    return {
      id: createWriterId('outline'),
      title: group.title,
      summary,
      mappedFields: group.fieldNames,
      status: index === 0 ? 'accepted' : 'pending',
    } satisfies WriterOutlineBlock
  })

  return blocks.length > 0
    ? blocks
    : [
        {
          id: createWriterId('outline'),
          title: '核心设定',
          summary: conceptCard?.premise || '先整理条目的核心概念、定位与关键亮点。',
          mappedFields: schema.fields.slice(0, 4).map((field) => field.name),
          status: 'accepted',
        },
      ]
}

export function mergeOutlineBlocks(current: WriterOutlineBlock[] | undefined, incoming: unknown, fallback: WriterOutlineBlock[]): WriterOutlineBlock[] {
  const nextOutline = normalizeOutlineBlocks(incoming)
  if (nextOutline.length > 0) return nextOutline
  if (current && current.length > 0) return current
  return fallback
}

