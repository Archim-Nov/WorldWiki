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

import { loadExistingWriterDraft } from '@/lib/writer/sanity/existing-doc'

describe('loadExistingWriterDraft', () => {
  it('normalizes a Sanity document into a writer draft', async () => {
    fetchMock.mockResolvedValueOnce({
      _id: 'hero-ailin',
      name: '艾琳',
      slug: { current: 'ailin' },
      bio: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: '第一段' }],
        },
      ],
      relatedHeroes: [{ _ref: 'hero-other' }],
    })

    const result = await loadExistingWriterDraft('hero', 'ailin')

    expect(result?.title).toBe('艾琳')
    expect(result?.draft.fields.slug).toBe('ailin')
    expect(result?.draft.fields.bio).toBe('第一段')
    expect(result?.draft.fields.__documentId).toBe('hero-ailin')
  })
})
