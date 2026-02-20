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

const regionMessages = {
  heroTag: 'Region Stage',
  emptyValue: 'Not recorded',
  emptySummary: 'No region summary yet.',
  emptyTravelAdvice: 'No travel advice yet.',
  emptyCountry: 'No linked country',
  overviewTitle: 'Region Overview',
  fields: {
    climate: 'Climate',
    terrain: 'Terrain',
    dangerLevel: 'Danger Level',
    relatedHeroes: 'Linked Heroes',
  },
  dangerLevels: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  },
  travelAdviceTitle: 'Travel Advice',
  countryTitle: 'Linked Country',
  countryArchive: 'Country Archive',
  landmarksTitle: 'Landmarks',
  landmarksSubtitle: 'Landmarks',
  featuredHeroesTitle: 'Featured Heroes',
  featuredHeroesSubtitle: 'Characters',
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
      const value = getByPath(regionMessages as unknown as Record<string, unknown>, key)
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

import RegionDetailPage from './page'

describe('RegionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders region summary and featured hero links', async () => {
    fetchMock.mockResolvedValueOnce({
      _id: 'region-1',
      name: 'Emerald Coast',
      summary: 'A trade shoreline with floating markets.',
      mapImage: 'https://example.com/map.jpg',
      country: { name: 'Avalon', slug: { current: 'avalon' } },
      featuredHeroes: [
        {
          _id: 'hero-1',
          name: 'Arthur',
          title: 'King',
          slug: { current: 'arthur' },
        },
        {
          _id: 'hero-2',
          name: 'Morgana',
          title: 'Sorcerer',
          slug: { current: 'morgana' },
        },
        {
          _id: 'hero-3',
          name: 'Gawain',
          title: 'Knight',
          slug: { current: 'gawain' },
        },
      ],
    })

    const page = await RegionDetailPage({
      params: Promise.resolve({ slug: 'emerald-coast' }),
    })
    render(page)

    expect(screen.getByRole('heading', { name: 'Emerald Coast' })).toBeInTheDocument()
    expect(screen.getAllByText('A trade shoreline with floating markets.').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Featured Heroes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Arthur/i })).toHaveAttribute('href', '/en/champions/arthur')
  })

  it('renders without featured-hero section when no heroes are configured', async () => {
    fetchMock
      .mockResolvedValueOnce({
        _id: 'region-2',
        name: 'Silent Marsh',
        country: { _id: 'country-1', name: 'Avalon', slug: { current: 'avalon' } },
      })
      .mockResolvedValueOnce([
        { _id: 'creature-1', _type: 'creature', name: 'Bog Drake', slug: { current: 'bog-drake' } },
        { _id: 'creature-2', _type: 'creature', name: 'Mire Rat', slug: { current: 'mire-rat' } },
        { _id: 'creature-3', _type: 'creature', name: 'Marsh Leech', slug: { current: 'marsh-leech' } },
      ])

    const page = await RegionDetailPage({
      params: Promise.resolve({ slug: 'silent-marsh' }),
    })
    render(page)

    expect(screen.queryByRole('heading', { name: 'Featured Heroes' })).not.toBeInTheDocument()
    expect(screen.getByText('Region Overview')).toBeInTheDocument()
  })

  it('calls notFound when region does not exist', async () => {
    fetchMock.mockResolvedValueOnce(null)

    await expect(
      RegionDetailPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('not-found')
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})
