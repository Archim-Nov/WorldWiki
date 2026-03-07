import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { mapDraftToSanityDocument } from '@/lib/writer/sanity/draft-mapper'

describe('mapDraftToSanityDocument', () => {
  it('converts slug strings into slug objects', () => {
    const document = mapDraftToSanityDocument('country', {
      name: '北境王国',
      slug: 'north kingdom',
      summary: '测试摘要',
    })

    expect(document.slug).toEqual({ current: 'north-kingdom' })
  })

  it('converts portable text strings into block arrays', () => {
    const document = mapDraftToSanityDocument('hero', {
      name: '艾琳',
      slug: 'ailin',
      bio: '第一段\n\n第二段',
    })

    expect(Array.isArray(document.bio)).toBe(true)
    expect((document.bio as unknown[]).length).toBe(2)
  })
})
