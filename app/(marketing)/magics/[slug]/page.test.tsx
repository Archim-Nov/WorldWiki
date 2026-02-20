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

const magicMessages = {
  principle: 'Principle',
  spell: 'Spell',
  elements: {
    fire: 'Fire',
    wind: 'Wind',
    earth: 'Earth',
    water: 'Water',
  },
  elementWithValue: 'Element: {element}',
  archiveTitle: 'Casting Archive',
  params: 'Parameters',
  fields: {
    difficulty: 'Difficulty',
    castType: 'Cast Type',
    manaCost: 'Mana Cost',
    cooldown: 'Cooldown',
    requirements: 'Requirements',
    risks: 'Risk Notes',
  },
  difficultyLabels: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    master: 'Master',
  },
  castTypeLabels: {
    instant: 'Instant',
    channel: 'Channel',
    ritual: 'Ritual',
  },
  detailKicker: 'Details',
  principleDetailTitle: 'Principle Notes',
  spellDetailTitle: 'Spell Notes',
  emptyValue: 'Not recorded',
  emptyRisk: 'No risk notes yet.',
  emptyDetailsPrinciple: 'Principle: No detailed notes yet.',
  emptyDetailsSpell: 'Spell: No detailed notes yet.',
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

function format(message: string, values?: Record<string, unknown>) {
  if (!values) return message
  return message.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`))
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
        : magicMessages

    return (key: string, values?: Record<string, unknown>) => {
      const value = getByPath(source as unknown as Record<string, unknown>, key)
      return typeof value === 'string' ? format(value, values) : key
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

import MagicDetailPage from './page'

describe('MagicDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders spell detail content, element, and recommendations', async () => {
    fetchMock
      .mockResolvedValueOnce({
        _id: 'magic-1',
        name: 'Arcane Bolt',
        kind: 'spell',
        element: 'fire',
        school: 'Arcane',
        summary: 'Fast projectile spell',
        details: [],
        relatedHeroes: [
          {
            _id: 'hero-1',
            name: 'Arthur',
            slug: { current: 'arthur' },
          },
        ],
        relatedStories: [],
        linkedRefs: [],
      })
      .mockResolvedValueOnce([])

    const page = await MagicDetailPage({
      params: Promise.resolve({ slug: 'arcane-bolt' }),
    })
    render(page)

    expect(screen.getByRole('heading', { name: 'Arcane Bolt' })).toBeInTheDocument()
    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(screen.getByText('Element: Fire')).toBeInTheDocument()
    expect(screen.getByText('Fast projectile spell')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Arthur/i })).toHaveAttribute('href', '/en/champions/arthur')
  })

  it('renders principle branch without element row', async () => {
    fetchMock
      .mockResolvedValueOnce({
        _id: 'magic-2',
        name: 'Ley Theory',
        kind: 'principle',
        school: 'Theory',
        summary: 'World rule',
        details: [],
        relatedHeroes: [],
        relatedStories: [],
        linkedRefs: [],
      })
      .mockResolvedValueOnce([])

    const page = await MagicDetailPage({
      params: Promise.resolve({ slug: 'ley-theory' }),
    })
    render(page)

    expect(screen.getByRole('heading', { name: 'Ley Theory' })).toBeInTheDocument()
    expect(screen.getByText('Principle')).toBeInTheDocument()
    expect(screen.queryByText(/Element:/)).not.toBeInTheDocument()
  })

  it('renders unified fallback copy when optional fields are missing', async () => {
    fetchMock
      .mockResolvedValueOnce({
        _id: 'magic-3',
        name: 'Unnamed Spell',
        kind: 'spell',
        element: 'wind',
        details: [],
        relatedHeroes: [],
        relatedStories: [],
        linkedRefs: [],
      })
      .mockResolvedValueOnce([])

    const page = await MagicDetailPage({
      params: Promise.resolve({ slug: 'unnamed-spell' }),
    })
    render(page)

    expect(screen.getAllByText('Not recorded').length).toBeGreaterThanOrEqual(5)
    expect(screen.getByText('No risk notes yet.')).toBeInTheDocument()
    expect(screen.getByText('Spell: No detailed notes yet.')).toBeInTheDocument()
  })

  it('calls notFound when magic does not exist', async () => {
    fetchMock.mockResolvedValueOnce(null)

    await expect(
      MagicDetailPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('not-found')
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})
