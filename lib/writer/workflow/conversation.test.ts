import { describe, expect, it } from 'vitest'
import { createConceptCard, createOutlineFromConceptCard, mergeConceptCard, mergeOutlineBlocks } from '@/lib/writer/workflow/conversation'

describe('writer conversation workflow', () => {
  it('creates a usable initial concept card', () => {
    const card = createConceptCard({
      title: '潮汐同盟',
      sourceText: '一个依靠潮汐魔法维护海运秩序的海上贸易国家。',
      documentType: 'country',
    })

    expect(card.premise).toContain('潮汐魔法')
    expect(card.candidateTypes[0]?.documentType).toBe('country')
    expect(card.openQuestions.length).toBeGreaterThan(0)
  })

  it('merges concept card patches without dropping stable content', () => {
    const current = createConceptCard({
      title: '潮汐同盟',
      sourceText: '一个依靠潮汐魔法维护海运秩序的海上贸易国家。',
      documentType: 'country',
    })

    current.goals = ['确定国家定位']
    current.decisions = [
      {
        id: 'decision_1',
        label: '政体',
        value: '海商议会',
        locked: true,
        source: 'assistant',
      },
    ]

    const next = mergeConceptCard(
      current,
      {
        tone: '冷静的设定集文风',
        goals: ['补足经济与军事逻辑'],
        decisions: [
          {
            label: '核心资源',
            value: '潮汐晶盐',
            locked: false,
            source: 'assistant',
          },
        ],
      },
      []
    )

    expect(next.goals).toContain('确定国家定位')
    expect(next.goals).toContain('补足经济与军事逻辑')
    expect(next.decisions.some((decision) => decision.label === '政体' && decision.locked)).toBe(true)
    expect(next.decisions.some((decision) => decision.label === '核心资源')).toBe(true)
  })

  it('creates a field-aware outline from concept and schema groups', () => {
    const conceptCard = createConceptCard({
      title: '潮汐同盟',
      sourceText: '一个依靠潮汐魔法维护海运秩序的海上贸易国家。',
      documentType: 'country',
    })

    conceptCard.goals = ['呈现其贸易秩序与海权结构']

    const outline = createOutlineFromConceptCard({
      conceptCard,
      schema: {
        documentType: 'country',
        title: '国家',
        titleField: 'name',
        slugField: 'slug',
        bodyField: 'content',
        fields: [
          { name: 'name', title: '名称', kind: 'string', required: true },
          { name: 'summary', title: '摘要', kind: 'text', required: false },
          { name: 'government', title: '政体', kind: 'text', required: false },
          { name: 'economy', title: '经济', kind: 'text', required: false },
        ],
        groups: [
          { id: 'core', title: '核心信息', fieldNames: ['name', 'summary'] },
          { id: 'structure', title: '国家结构', fieldNames: ['government', 'economy'] },
        ],
      },
    })

    expect(outline.length).toBe(2)
    expect(outline[0]?.mappedFields).toContain('name')
    expect(outline[0]?.status).toBe('accepted')
  })

  it('prefers parsed outline blocks over fallback and keeps current outline when incoming is empty', () => {
    const fallback = [
      {
        id: 'outline_1',
        title: '核心设定',
        summary: 'fallback',
        mappedFields: ['summary'],
        status: 'pending' as const,
      },
    ]

    const merged = mergeOutlineBlocks([], [{ title: '雏形 A', summary: 'parsed', mappedFields: ['name'] }], fallback)
    expect(merged[0]?.title).toBe('雏形 A')

    const kept = mergeOutlineBlocks(
      [
        {
          id: 'outline_2',
          title: '已有雏形',
          summary: 'keep',
          mappedFields: ['government'],
          status: 'accepted',
        },
      ],
      [],
      fallback
    )
    expect(kept[0]?.title).toBe('已有雏形')
  })
})
