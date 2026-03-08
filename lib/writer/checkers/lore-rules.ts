import 'server-only'

import { groq } from 'next-sanity'
import type { WriterCheckIssue, WriterDraft } from '@/types/writer'
import { client } from '@/lib/sanity/client'
import { hasMeaningfulWriterValue } from '@/lib/writer/draft-fields'
import { portableTextToPlainText } from '@/lib/writer/sanity/portable-text'

type ReferenceLookupResult = {
  _id: string
  country?: {
    _id?: string
  }
}

const regionCountryQuery = groq`
  *[_id in [$regionId, $draftRegionId]][0] {
    _id,
    country->{
      _id
    }
  }
`

const recommendedFieldMap: Record<string, string[]> = {
  country: ['kind', 'mapImage', 'summary'],
  region: ['mapImage', 'summary', 'country'],
  hero: ['portrait', 'region', 'country', 'bio'],
  creature: ['portrait', 'category', 'bio'],
  story: ['coverImage', 'content'],
  magic: ['kind', 'summary', 'details'],
}

function createIssue(issue: Omit<WriterCheckIssue, 'id'>): WriterCheckIssue {
  return {
    id: `${issue.code}_${issue.fieldName ?? 'general'}_${issue.level}`,
    ...issue,
  }
}

function getPlainLength(value: unknown) {
  if (typeof value === 'string') return value.trim().length
  return portableTextToPlainText(value).trim().length
}

function getReferenceId(value: unknown) {
  if (value && typeof value === 'object' && '_ref' in value) {
    const ref = (value as { _ref?: string })._ref?.trim()
    return ref || null
  }
  return null
}

function getReferenceCount(value: unknown) {
  return Array.isArray(value) ? value.length : 0
}

function createRecommendedFieldWarnings(draft: WriterDraft) {
  const fieldNames = recommendedFieldMap[draft.documentType] ?? []
  return fieldNames
    .filter((fieldName) => !hasMeaningfulWriterValue(draft.fields[fieldName]))
    .map((fieldName) =>
      createIssue({
        level: 'warning',
        code: 'recommended-field-missing',
        fieldName,
        message: `建议补充字段 ${fieldName}，以提升条目完整度。`,
      })
    )
}

function createLengthWarnings(draft: WriterDraft) {
  const issues: WriterCheckIssue[] = []
  const summaryLength = getPlainLength(draft.fields.summary)
  if (summaryLength > 0 && summaryLength < 50) {
    issues.push(
      createIssue({
        level: 'warning',
        code: 'summary-too-short',
        fieldName: 'summary',
        message: 'summary 建议至少 50 字，方便在列表和详情页中承担概述作用。',
      })
    )
  }

  if (draft.documentType === 'hero' || draft.documentType === 'creature') {
    const bodyField = draft.documentType === 'hero' ? 'bio' : 'bio'
    const bodyLength = getPlainLength(draft.fields[bodyField])
    if (bodyLength > 0 && bodyLength < 200) {
      issues.push(
        createIssue({
          level: 'warning',
          code: 'bio-too-short',
          fieldName: bodyField,
          message: `${bodyField} 建议 200–600 字，当前内容偏短。`,
        })
      )
    }
  }

  if (draft.documentType === 'story') {
    const contentLength = getPlainLength(draft.fields.content)
    if (contentLength > 0 && contentLength < 1000) {
      issues.push(
        createIssue({
          level: 'warning',
          code: 'story-too-short',
          fieldName: 'content',
          message: 'story.content 建议 1000 字以上，当前内容偏短。',
        })
      )
    }
  }

  return issues
}

function createDocumentTypeWarnings(draft: WriterDraft) {
  const issues: WriterCheckIssue[] = []

  if (draft.documentType === 'creature' && !hasMeaningfulWriterValue(draft.fields.category)) {
    issues.push(
      createIssue({
        level: 'error',
        code: 'creature-category-missing',
        fieldName: 'category',
        message: '生物条目必须填写 category。',
      })
    )
  }

  if (draft.documentType === 'magic') {
    const kind = typeof draft.fields.kind === 'string' ? draft.fields.kind : ''
    if (!kind) {
      issues.push(
        createIssue({
          level: 'error',
          code: 'magic-kind-missing',
          fieldName: 'kind',
          message: '魔法条目必须设置 kind。',
        })
      )
    }

    if (kind === 'spell' && !hasMeaningfulWriterValue(draft.fields.element)) {
      issues.push(
        createIssue({
          level: 'error',
          code: 'magic-element-missing',
          fieldName: 'element',
          message: '法术类魔法必须选择 element。',
        })
      )
    }
  }

  if (draft.documentType === 'story') {
    const relatedCount =
      getReferenceCount(draft.fields.relatedHeroes) +
      getReferenceCount(draft.fields.relatedRegions) +
      getReferenceCount(draft.fields.relatedCreatures)

    if (relatedCount === 0) {
      issues.push(
        createIssue({
          level: 'warning',
          code: 'story-related-empty',
          message: '建议至少补充 1 条相关角色、地区或生物，便于页面做相关推荐。',
        })
      )
    }
  }

  if (draft.documentType === 'hero' || draft.documentType === 'creature') {
    if (!hasMeaningfulWriterValue(draft.fields.region) && !hasMeaningfulWriterValue(draft.fields.country)) {
      issues.push(
        createIssue({
          level: 'warning',
          code: 'location-context-missing',
          message: '建议至少补充 region 或 country，以保持条目在世界中的定位。',
        })
      )
    }
  }

  return issues
}

async function createReferenceConsistencyWarnings(draft: WriterDraft) {
  const issues: WriterCheckIssue[] = []
  if (draft.documentType !== 'hero' && draft.documentType !== 'creature') {
    return issues
  }

  const regionId = getReferenceId(draft.fields.region)
  const countryId = getReferenceId(draft.fields.country)
  if (!regionId || !countryId) {
    return issues
  }

  const region = await client.fetch<ReferenceLookupResult | null>(regionCountryQuery, {
    regionId,
    draftRegionId: regionId.startsWith('drafts.') ? regionId : `drafts.${regionId}`,
  })

  const linkedCountryId = region?.country?._id
  if (linkedCountryId && linkedCountryId !== countryId) {
    issues.push(
      createIssue({
        level: 'warning',
        code: 'region-country-mismatch',
        message: '当前 region 与 country 的归属关系可能不一致，请确认它们是否属于同一世界设定链路。',
      })
    )
  }

  return issues
}

export async function runLoreRuleChecks(draft: WriterDraft) {
  const issues = [
    ...createRecommendedFieldWarnings(draft),
    ...createLengthWarnings(draft),
    ...createDocumentTypeWarnings(draft),
    ...(await createReferenceConsistencyWarnings(draft)),
  ]

  return issues
}
