/** @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock, notFoundMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error('not-found')
  }),
}))

const storyMessages = {
  heroTag: 'Short Story',
  scrollToStart: 'Scroll to begin',
  articleTag: 'Short Story',
  emptyContent:
    'Story body content will be added in later iterations with richer layout and narrative structure.',
}

function getByPath(source: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, source)
}

vi.mock('@/lib/sanity/client', () => ({
  client: {
    fetch: fetchMock,
  },
}))

vi.mock('next-intl/server', () => ({
  getTranslations: async () => {
    return (key: string) => {
      const value = getByPath(storyMessages as unknown as Record<string, unknown>, key)
      return typeof value === 'string' ? value : key
    }
  },
}))

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/portable/PortableContent', () => ({
  PortableContent: ({ value }: { value: unknown }) => {
    if (!Array.isArray(value)) return <div />
    const text = value
      .flatMap((block) =>
        Array.isArray((block as { children?: unknown[] }).children)
          ? ((block as { children: unknown[] }).children ?? [])
          : []
      )
      .map((child) =>
        typeof (child as { text?: unknown }).text === 'string'
          ? ((child as { text: string }).text ?? '')
          : ''
      )
      .join('')
    return <div>{text}</div>
  },
}))

vi.mock('@/components/marketing/RecommendationGrid', () => ({
  RecommendationGrid: ({
    items,
  }: {
    items: Array<{ _id: string; title: string; href: string }>
  }) => (
    <div data-testid="recommendation-grid">
      {items.map((item) => (
        <a key={item._id} href={`/en${item.href}`}>
          {item.title}
        </a>
      ))}
    </div>
  ),
}))

vi.mock('@/components/marketing/StoryScrollFade', () => ({
  StoryScrollFade: () => <div data-testid="story-scroll-fade" />,
}))

import StoryDetailPage from './page'

describe('StoryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders story title and portable content', async () => {
    fetchMock.mockResolvedValueOnce({
      _id: 'story-1',
      title: 'Battle of Dawn',
      coverImage: 'https://example.com/story.jpg',
      content: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: 'c1',
              text: 'Once the dawn broke over the wall.',
              marks: [],
            },
          ],
        },
      ],
      linkedRefs: [],
      relatedHeroes: [
        { _id: 'hero-1', name: 'Arthur', slug: { current: 'arthur' } },
        { _id: 'hero-2', name: 'Morgana', slug: { current: 'morgana' } },
        { _id: 'hero-3', name: 'Gawain', slug: { current: 'gawain' } },
      ],
      relatedRegions: [],
      relatedCreatures: [],
    })

    const page = await StoryDetailPage({
      params: Promise.resolve({ slug: 'battle-of-dawn' }),
    })
    render(page)

    expect(screen.getAllByRole('heading', { name: 'Battle of Dawn' }).length).toBeGreaterThan(0)
    expect(screen.getByText('Once the dawn broke over the wall.')).toBeInTheDocument()
    expect(screen.getAllByText('Short Story').length).toBeGreaterThan(0)
  })

  it('renders fallback text when story content is missing', async () => {
    fetchMock.mockResolvedValueOnce({
      _id: 'story-2',
      title: 'Last Winter',
      linkedRefs: [],
      relatedHeroes: [
        { _id: 'hero-1', name: 'Arthur', slug: { current: 'arthur' } },
        { _id: 'hero-2', name: 'Morgana', slug: { current: 'morgana' } },
        { _id: 'hero-3', name: 'Gawain', slug: { current: 'gawain' } },
      ],
      relatedRegions: [],
      relatedCreatures: [],
    })

    const page = await StoryDetailPage({
      params: Promise.resolve({ slug: 'last-winter' }),
    })
    render(page)

    expect(screen.getByText(storyMessages.emptyContent)).toBeInTheDocument()
  })

  it('calls notFound when story does not exist', async () => {
    fetchMock.mockResolvedValueOnce(null)

    await expect(
      StoryDetailPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('not-found')
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})
