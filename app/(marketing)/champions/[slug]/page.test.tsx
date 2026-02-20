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

const heroMessages = {
  heroTag: 'Champion Archive',
  relatedHeroesTitle: 'Related Champions',
  emptyRelatedHeroes: 'No related champions yet.',
  quoteFallback: 'If I do not even know the rules, how can breaking them define me?',
  quoteMeta: 'Champion Quote',
  bioTitle: 'Biography',
  bioExpand: 'Click to expand',
  close: 'Close',
  bioEmpty: 'Biography content will be added later.',
  profileTitle: 'Character Profile',
  fields: {
    alias: 'Alias',
    age: 'Age',
    status: 'Status',
    faction: 'Faction',
    roles: 'Roles',
    weapon: 'Weapon',
    motto: 'Motto',
    region: 'Region',
    country: 'Country',
  },
  statusLabels: {
    active: 'Active',
    missing: 'Missing',
    deceased: 'Deceased',
  },
  crestTitle: 'Crest',
  storiesTitle: 'Short Stories',
  storiesSubtitle: 'Story Links',
  storyCardTag: 'Short Story',
  readStory: 'Read Story ->',
  emptyRelatedStories: 'No related short stories yet.',
  miscTitle: 'Misc',
  miscSubtitle: 'Misc',
  misc: {
    conceptArt: 'Concept Sketches',
    equipmentBadges: 'Equipment and Badges',
  },
  otherHeroesTitle: 'Other Champions',
  otherHeroesSubtitle: 'Others',
  emptyOtherHeroes: 'No other champions to recommend.',
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
  getLocale: async () => 'en',
  getTranslations: async () => {
    return (key: string) => {
      const value = getByPath(heroMessages as unknown as Record<string, unknown>, key)
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

import HeroDetailPage from './page'

describe('HeroDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders hero profile, bio, and related story links', async () => {
    fetchMock.mockResolvedValueOnce({
      _id: 'hero-1',
      name: 'Arthur',
      title: 'Knight of Dawn',
      slug: { current: 'arthur' },
      portrait: 'https://example.com/arthur.jpg',
      faction: 'Round Table',
      roles: ['Tank', 'Leader'],
      region: {
        name: 'Camelot',
        slug: { current: 'camelot' },
      },
      country: {
        name: 'Britannia',
        slug: { current: 'britannia' },
      },
      bio: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: 'c1', text: 'Arthur bio', marks: [] }],
        },
      ],
      linkedRefs: [],
      relatedHeroes: [
        { _id: 'hero-2', name: 'Lancelot', slug: { current: 'lancelot' } },
        { _id: 'hero-3', name: 'Morgana', slug: { current: 'morgana' } },
        { _id: 'hero-4', name: 'Gawain', slug: { current: 'gawain' } },
      ],
      relatedStories: [
        {
          _id: 'story-1',
          title: 'Battle of Dawn',
          slug: { current: 'battle-of-dawn' },
          coverImage: 'https://example.com/story.jpg',
        },
      ],
    })

    const page = await HeroDetailPage({
      params: Promise.resolve({ slug: 'arthur' }),
    })
    render(page)

    expect(screen.getByRole('heading', { name: 'Arthur' })).toBeInTheDocument()
    expect(screen.getByText('Knight of Dawn')).toBeInTheDocument()
    expect(screen.getAllByText('Arthur bio').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Camelot' })).toHaveAttribute('href', '/en/regions/camelot')
    expect(screen.getByRole('link', { name: 'Britannia' })).toHaveAttribute('href', '/en/countries/britannia')
    expect(screen.getByRole('heading', { name: 'Battle of Dawn' })).toBeInTheDocument()
  })

  it('renders empty-state text when bio and stories are missing', async () => {
    fetchMock.mockResolvedValueOnce({
      _id: 'hero-5',
      name: 'Merlin',
      slug: { current: 'merlin' },
      relatedHeroes: [
        { _id: 'hero-2', name: 'Lancelot', slug: { current: 'lancelot' } },
        { _id: 'hero-3', name: 'Morgana', slug: { current: 'morgana' } },
        { _id: 'hero-4', name: 'Gawain', slug: { current: 'gawain' } },
      ],
      relatedStories: [],
    })

    const page = await HeroDetailPage({
      params: Promise.resolve({ slug: 'merlin' }),
    })
    render(page)

    expect(screen.getByText('Biography content will be added later.')).toBeInTheDocument()
    expect(screen.getByText('No related short stories yet.')).toBeInTheDocument()
  })

  it('calls notFound when hero does not exist', async () => {
    fetchMock.mockResolvedValueOnce(null)

    await expect(
      HeroDetailPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('not-found')
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})
