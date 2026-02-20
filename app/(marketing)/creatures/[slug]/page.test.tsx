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

const creatureMessages = {
  heroTag: 'Creature Record',
  fields: {
    category: 'Category',
    region: 'Region',
    country: 'Country',
    habitat: 'Habitat',
    diet: 'Diet',
    temperament: 'Temperament',
    activityCycle: 'Activity Cycle',
    threatLevel: 'Threat Level',
    abilities: 'Ability Tags',
  },
  ecologyKicker: 'Ecology',
  ecologyTitle: 'Ecology Description',
  emptyValue: 'Not recorded',
  emptyBio: 'No ecology description yet.',
  categories: {
    animal: 'Animal',
    plant: 'Plant',
    element: 'Element',
  },
  threatLevels: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  },
}

const recommendationMessages = {
  title: 'Related Picks',
  subtitle: 'Related Picks',
  empty: 'No related content yet.',
  types: {
    hero: 'Champion',
    region: 'Region',
    country: 'Country',
    creature: 'Creature',
    story: 'Story',
    magic: 'Magic',
  },
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
  getTranslations: async (namespace: string) => {
    const source =
      namespace === 'RecommendationGrid'
        ? recommendationMessages
        : creatureMessages

    return (key: string, values?: Record<string, unknown>) => {
      const value = getByPath(source as unknown as Record<string, unknown>, key)
      if (typeof value !== 'string') {
        return key
      }
      if (!values) return value
      return value.replace(/\{(\w+)\}/g, (_, token) => String(values[token] ?? `{${token}}`))
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

import CreatureDetailPage from './page'

describe('CreatureDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders creature details, ecology content, and region links', async () => {
    fetchMock.mockResolvedValueOnce({
      _id: 'creature-1',
      name: 'Silver Wolf',
      category: 'animal',
      species: 'Lupus Argent',
      portrait: 'https://example.com/wolf.jpg',
      region: { name: 'Northern Peaks', slug: { current: 'northern-peaks' } },
      country: { name: 'Avalon', slug: { current: 'avalon' } },
      bio: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: 'c1', text: 'Ecology overview', marks: [] }],
        },
      ],
      relatedStories: [
        { _id: 'story-1', title: 'Moon Hunt', slug: { current: 'moon-hunt' } },
        { _id: 'story-2', title: 'Snow Trail', slug: { current: 'snow-trail' } },
        { _id: 'story-3', title: 'Last Fang', slug: { current: 'last-fang' } },
      ],
      linkedRefs: [],
    })

    const page = await CreatureDetailPage({
      params: Promise.resolve({ slug: 'silver-wolf' }),
    })
    render(page)

    expect(screen.getByRole('heading', { name: 'Silver Wolf' })).toBeInTheDocument()
    expect(screen.getAllByText('Animal').length).toBeGreaterThan(0)
    expect(screen.getByText('Ecology overview')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Northern Peaks' })).toHaveAttribute(
      'href',
      '/en/regions/northern-peaks'
    )
    expect(screen.getByRole('link', { name: 'Avalon' })).toHaveAttribute('href', '/en/countries/avalon')
  })

  it('renders fallback ecology text when bio is missing', async () => {
    fetchMock.mockResolvedValueOnce({
      _id: 'creature-2',
      name: 'Stone Ent',
      category: 'element',
      relatedStories: [
        { _id: 'story-1', title: 'Root War', slug: { current: 'root-war' } },
        { _id: 'story-2', title: 'Deep Soil', slug: { current: 'deep-soil' } },
        { _id: 'story-3', title: 'Echo Bark', slug: { current: 'echo-bark' } },
      ],
      linkedRefs: [],
    })

    const page = await CreatureDetailPage({
      params: Promise.resolve({ slug: 'stone-ent' }),
    })
    render(page)

    expect(screen.getByText('No ecology description yet.')).toBeInTheDocument()
  })

  it('calls notFound when creature does not exist', async () => {
    fetchMock.mockResolvedValueOnce(null)

    await expect(
      CreatureDetailPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('not-found')
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})
