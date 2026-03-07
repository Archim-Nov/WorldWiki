import { describe, expect, it } from 'vitest'
import type { WriterSession } from '@/types/writer'
import { buildOutlineExpansionInstruction, markOutlineBlocksExpanded, pickOutlineBlocksForExpansion } from '@/lib/writer/workflow/expand'

const baseSession: WriterSession = {
  id: 'session_1',
  title: '潮汐同盟',
  documentType: 'country',
  presetIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  workflowMode: 'conversation',
  stage: 'outline',
  status: 'draft',
  messages: [],
  draft: {
    documentType: 'country',
    sourceText: '一个依靠潮汐魔法维护海运秩序的海上贸易国家。',
    fields: {},
    lockedFields: [],
    updatedAt: new Date().toISOString(),
  },
  outline: [
    {
      id: 'outline_a',
      title: '核心信息',
      summary: '建立国家定位与摘要。',
      mappedFields: ['name', 'summary'],
      status: 'accepted',
    },
    {
      id: 'outline_b',
      title: '国家结构',
      summary: '描述政体与经济。',
      mappedFields: ['government', 'economy'],
      status: 'pending',
    },
  ],
}

describe('writer outline expansion workflow', () => {
  it('prefers explicit outline block selection', () => {
    const blocks = pickOutlineBlocksForExpansion(baseSession, ['outline_b'])
    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.id).toBe('outline_b')
  })

  it('falls back to accepted blocks', () => {
    const blocks = pickOutlineBlocksForExpansion(baseSession)
    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.id).toBe('outline_a')
  })

  it('builds an expansion instruction from selected blocks', () => {
    const instruction = buildOutlineExpansionInstruction({
      schema: {
        documentType: 'country',
        title: '国家',
        titleField: 'name',
        slugField: 'slug',
        fields: [],
        groups: [],
      },
      blocks: [baseSession.outline![0]],
    })

    expect(instruction).toContain('核心信息')
    expect(instruction).toContain('name、summary')
  })

  it('marks target blocks as expanded', () => {
    const outline = markOutlineBlocksExpanded(baseSession.outline, ['outline_b'])
    expect(outline?.find((block) => block.id === 'outline_b')?.status).toBe('expanded')
    expect(outline?.find((block) => block.id === 'outline_a')?.status).toBe('accepted')
  })
})
