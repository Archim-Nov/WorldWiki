import { describe, expect, it } from 'vitest'
import type { WriterCheckResult, WriterSchemaSummary, WriterSession } from '@/types/writer'
import { applyWriterCalibrationPatches, buildWriterCalibrationPatches } from '@/lib/writer/workflow/calibration'

const magicSchema: WriterSchemaSummary = {
  documentType: 'magic',
  title: '魔法',
  titleField: 'name',
  slugField: 'slug',
  bodyField: 'details',
  fields: [
    { name: 'name', title: '名称', kind: 'string', required: true },
    { name: 'slug', title: 'Slug', kind: 'slug', required: true },
    {
      name: 'kind',
      title: '类型',
      kind: 'string',
      required: false,
      options: [
        { title: '原理', value: 'principle' },
        { title: '法术', value: 'spell' },
      ],
    },
    {
      name: 'element',
      title: '元素',
      kind: 'string',
      required: false,
      options: [
        { title: '火', value: 'fire' },
        { title: '风', value: 'wind' },
        { title: '土', value: 'earth' },
        { title: '水', value: 'water' },
      ],
    },
    { name: 'summary', title: '摘要', kind: 'text', required: false },
    { name: 'details', title: '正文', kind: 'portableText', required: false },
  ],
  groups: [],
}

function createBaseSession(): WriterSession {
  return {
    id: 'session_1',
    title: '潮汐同盟',
    documentType: 'magic',
    presetIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workflowMode: 'conversation',
    stage: 'drafting',
    status: 'draft',
    messages: [],
    draft: {
      documentType: 'magic',
      sourceText: '一种借潮汐流动召唤海雾与海浪的法术体系。',
      fields: {
        name: '潮雾术式',
        slug: '潮雾 术式',
        summary: '操纵潮雾。',
      },
      lockedFields: [],
      updatedAt: new Date().toISOString(),
    },
    conceptCard: {
      premise: '以潮汐规律和海雾折射为核心的法术体系。',
      goals: ['突出海运秩序与潮汐魔法的关系'],
      constraints: ['保持百科式口吻'],
      candidateTypes: [{ documentType: 'magic', score: 1, reason: '会话类型' }],
      openQuestions: ['它在航路管理中最关键的用途是什么？'],
      decisions: [
        {
          id: 'decision_1',
          label: '施法方式',
          value: '以潮位变化作为触发条件',
          locked: true,
          source: 'assistant',
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    outline: [
      {
        id: 'outline_1',
        title: '核心设定',
        summary: '交代法术的来源、用途与世界观定位。',
        mappedFields: ['summary', 'details'],
        status: 'accepted',
      },
    ],
  }
}

describe('writer calibration workflow', () => {
  it('builds deterministic patches for slug, kind, element and summary', () => {
    const session = createBaseSession()
    const checkResult: WriterCheckResult = {
      issues: [
        { id: 'slug', level: 'warning', code: 'slug-has-spaces', message: 'slug', fieldName: 'slug' },
        { id: 'kind', level: 'error', code: 'magic-kind-missing', message: 'kind', fieldName: 'kind' },
        { id: 'element', level: 'error', code: 'magic-element-missing', message: 'element', fieldName: 'element' },
        { id: 'summary', level: 'warning', code: 'summary-too-short', message: 'summary', fieldName: 'summary' },
      ],
      duplicates: [],
      relatedSuggestions: [],
      checkedAt: new Date().toISOString(),
    }

    const patches = buildWriterCalibrationPatches({ session, schema: magicSchema, checkResult })

    expect(patches.some((patch) => patch.fieldName === 'slug' && patch.nextValue === '潮雾-术式')).toBe(true)
    expect(patches.some((patch) => patch.fieldName === 'kind' && patch.nextValue === 'spell')).toBe(true)
    expect(patches.some((patch) => patch.fieldName === 'element' && patch.nextValue === 'water')).toBe(true)
    expect(patches.some((patch) => patch.fieldName === 'summary' && String(patch.nextValue).length > 20)).toBe(true)
  })

  it('skips locked fields when creating patches', () => {
    const session = createBaseSession()
    session.draft.lockedFields = ['summary']

    const checkResult: WriterCheckResult = {
      issues: [{ id: 'summary', level: 'warning', code: 'summary-too-short', message: 'summary', fieldName: 'summary' }],
      duplicates: [],
      relatedSuggestions: [],
      checkedAt: new Date().toISOString(),
    }

    const patches = buildWriterCalibrationPatches({ session, schema: magicSchema, checkResult })
    expect(patches).toHaveLength(0)
  })

  it('applies selected patches into draft fields', () => {
    const session = createBaseSession()
    session.calibrationPatches = [
      {
        id: 'patch_slug',
        kind: 'schema',
        title: '修正 slug',
        reason: 'normalize',
        fieldName: 'slug',
        nextValue: '潮雾-术式',
      },
      {
        id: 'patch_summary',
        kind: 'style',
        title: '扩写摘要',
        reason: 'expand',
        fieldName: 'summary',
        nextValue: '潮雾术式是一种依托潮汐规律驱动的海洋法术。',
      },
    ]

    const result = applyWriterCalibrationPatches({ session, patchIds: ['patch_summary'] })

    expect(result.draft.fields.summary).toBe('潮雾术式是一种依托潮汐规律驱动的海洋法术。')
    expect(result.draft.fields.slug).toBe('潮雾 术式')
    expect(result.appliedPatches).toHaveLength(1)
    expect(result.remainingPatches).toHaveLength(1)
  })
})
