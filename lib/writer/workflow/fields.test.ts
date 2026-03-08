import { describe, expect, it } from 'vitest'
import { applyWriterFieldPatch } from '@/lib/writer/workflow/fields'

describe('applyWriterFieldPatch', () => {
  it('skips locked fields during chat sync', () => {
    const result = applyWriterFieldPatch({
      currentFields: {
        summary: '旧摘要',
        bio: '锁定正文',
      },
      incomingFields: {
        summary: '新摘要',
        bio: 'AI 试图改正文',
      },
      lockedFields: ['bio'],
      mode: 'chat',
      allowedFieldNames: ['summary', 'bio'],
    })

    expect(result.fields.summary).toBe('新摘要')
    expect(result.fields.bio).toBe('锁定正文')
    expect(result.appliedFieldNames).toEqual(['summary'])
    expect(result.skippedLockedFieldNames).toEqual(['bio'])
  })

  it('keeps existing value when fill-missing meets populated field', () => {
    const result = applyWriterFieldPatch({
      currentFields: {
        summary: '已有摘要',
        customs: '',
      },
      incomingFields: {
        summary: 'AI 新摘要',
        customs: '新增风俗',
      },
      lockedFields: [],
      mode: 'fill-missing',
      allowedFieldNames: ['summary', 'customs'],
    })

    expect(result.fields.summary).toBe('已有摘要')
    expect(result.fields.customs).toBe('新增风俗')
    expect(result.skippedFilledFieldNames).toEqual(['summary'])
  })
})