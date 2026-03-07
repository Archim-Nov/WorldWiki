import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}))

vi.mock('@/lib/sanity/client', () => ({
  client: {
    fetch: fetchMock,
  },
}))

import { runLoreRuleChecks } from '@/lib/writer/checkers/lore-rules'

describe('runLoreRuleChecks', () => {
  it('warns when summary is too short and recommended fields are missing', async () => {
    fetchMock.mockResolvedValueOnce(null)

    const issues = await runLoreRuleChecks({
      documentType: 'country',
      sourceText: '',
      fields: {
        name: '北境王国',
        slug: 'north-kingdom',
        summary: '太短了',
      },
      lockedFields: [],
      updatedAt: new Date().toISOString(),
    })

    expect(issues.some((issue) => issue.code === 'summary-too-short')).toBe(true)
    expect(issues.some((issue) => issue.code === 'recommended-field-missing' && issue.fieldName === 'mapImage')).toBe(true)
  })

  it('requires element for spell magic', async () => {
    fetchMock.mockResolvedValueOnce(null)

    const issues = await runLoreRuleChecks({
      documentType: 'magic',
      sourceText: '',
      fields: {
        name: '炎枪',
        slug: 'fire-lance',
        kind: 'spell',
        summary: '一种高温穿刺法术，会在远距离灼穿护甲。',
      },
      lockedFields: [],
      updatedAt: new Date().toISOString(),
    })

    expect(issues.some((issue) => issue.code === 'magic-element-missing')).toBe(true)
  })
})
