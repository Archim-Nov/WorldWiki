/** @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { cleanup, render, screen } from '@testing-library/react'
import type { ElementType, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}))

const magicsPageMessages = {
  eyebrow: 'Magic',
  title: 'Magic Atlas',
  lead: 'Split magic into principles and spells to understand world rules and practical usage.',
  empty: 'No magic entries yet. Create entries in Studio first.',
}

const magicsFilterMessages = {
  switchAria: 'Switch between principles and spells',
  all: 'All',
  principle: 'Principles',
  spell: 'Spells',
  subtitlePrinciple: 'Principles',
  subtitleSpell: 'Spells',
  emptyPrinciple: 'No principle entries yet.',
  emptySpell: 'No spell entries yet.',
  summaryFallback: 'Open this magic entry to view full details and linked content.',
  filters: 'Filters',
  showing: 'Showing {current} of {total}',
  clearFilters: 'Clear filters',
  elementFilter: 'Element filter',
  elementFilterAria: 'Spell element filters',
  elements: {
    fire: 'Fire',
    wind: 'Wind',
    earth: 'Earth',
    water: 'Water',
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
  getTranslations: async (namespace: string) => {
    const source = namespace === 'MagicsFilter' ? magicsFilterMessages : magicsPageMessages
    return (key: string, values?: Record<string, unknown>) => {
      const value = getByPath(source as unknown as Record<string, unknown>, key)
      return typeof value === 'string' ? format(value, values) : key
    }
  },
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace: string) => {
    const source = namespace === 'MagicsFilter' ? magicsFilterMessages : magicsPageMessages
    return (key: string, values?: Record<string, unknown>) => {
      const value = getByPath(source as unknown as Record<string, unknown>, key)
      return typeof value === 'string' ? format(value, values) : key
    }
  },
}))

vi.mock('@/components/marketing/ScrollReveal', () => ({
  ScrollReveal: ({
    children,
    as: Tag = 'div',
  }: {
    children: ReactNode
    as?: ElementType
  }) => <Tag>{children}</Tag>,
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

import MagicsPage from './page'

describe('MagicsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders empty state when no magics exist', async () => {
    fetchMock.mockResolvedValue([])
    const page = await MagicsPage()
    render(page)

    expect(screen.getByText(magicsPageMessages.empty)).toBeInTheDocument()
  })

  it('switches sections with buttons without refetching', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'magic-1',
        name: 'Arcane Bolt',
        slug: { current: 'arcane-bolt' },
        kind: 'spell',
        element: 'fire',
        school: 'Arcane',
      },
      {
        _id: 'magic-3',
        name: 'Tidal Ring',
        slug: { current: 'tidal-ring' },
        kind: 'spell',
        element: 'water',
        school: 'Control',
      },
      {
        _id: 'magic-2',
        name: 'Ley Theory',
        slug: { current: 'ley-theory' },
        kind: 'principle',
      },
    ])

    const page = await MagicsPage()
    render(page)
    const user = userEvent.setup()

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Principles' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Spells' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    expect(screen.queryByText('Showing 3 of 3')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Principles' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Spells' }).length).toBeGreaterThan(0)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Principles' }))

    expect(screen.getByRole('heading', { name: 'Principles' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Spells' })).not.toBeInTheDocument()
    expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Clear filters/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Principles' })).toHaveAttribute('aria-pressed', 'true')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Spells' }))

    expect(screen.getByText('Element filter')).toBeInTheDocument()
    expect(document.querySelector('button[data-element-filter="fire"]')).not.toBeNull()
    expect(document.querySelector('button[data-element-filter="water"]')).not.toBeNull()
    expect(screen.getByText('Showing 2 of 2')).toBeInTheDocument()

    const fireFilter = document.querySelector<HTMLButtonElement>('button[data-element-filter="fire"]')
    if (!fireFilter) {
      throw new Error('Fire element button should exist')
    }
    await user.click(fireFilter)

    expect(screen.getByRole('link', { name: /Arcane Bolt/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Tidal Ring/i })).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Clear filters/i }))
    expect(screen.getByText('Showing 2 of 2')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows only principle section when filtered by search params', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'magic-1',
        name: 'Arcane Bolt',
        slug: { current: 'arcane-bolt' },
        kind: 'spell',
        element: 'fire',
      },
      {
        _id: 'magic-2',
        name: 'Ley Theory',
        slug: { current: 'ley-theory' },
        kind: 'principle',
      },
    ])

    const page = await MagicsPage({
      searchParams: Promise.resolve({ kind: 'principle' }),
    })
    render(page)

    expect(screen.getByRole('heading', { name: 'Principles' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Spells' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ley Theory/i })).toHaveAttribute('href', '/en/magics/ley-theory')
  })

  it('supports keyboard interaction for spell element filters', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'magic-1',
        name: 'Arcane Bolt',
        slug: { current: 'arcane-bolt' },
        kind: 'spell',
        element: 'fire',
      },
      {
        _id: 'magic-3',
        name: 'Tidal Ring',
        slug: { current: 'tidal-ring' },
        kind: 'spell',
        element: 'water',
      },
      {
        _id: 'magic-2',
        name: 'Ley Theory',
        slug: { current: 'ley-theory' },
        kind: 'principle',
      },
    ])

    const page = await MagicsPage()
    render(page)
    const user = userEvent.setup()

    const spellTab = screen.getByRole('button', { name: 'Spells' })

    await user.tab()
    await user.tab()
    await user.tab()
    expect(spellTab).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(spellTab).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Showing 2 of 2')).toBeInTheDocument()

    const fireElementButton = document.querySelector<HTMLButtonElement>('button[data-element-filter="fire"]')
    if (!fireElementButton) {
      throw new Error('Fire element button should exist')
    }
    fireElementButton.focus()
    expect(fireElementButton).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('link', { name: /Arcane Bolt/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Tidal Ring/i })).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 2')).toBeInTheDocument()

    const clearButton = screen.getByRole('button', { name: /Clear filters/i })
    clearButton.focus()
    expect(clearButton).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByText('Showing 2 of 2')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Clear filters/i })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows spell section and element filters when kind=spell is provided', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'magic-1',
        name: 'Arcane Bolt',
        slug: { current: 'arcane-bolt' },
        kind: 'spell',
        element: 'fire',
      },
      {
        _id: 'magic-3',
        name: 'Tidal Ring',
        slug: { current: 'tidal-ring' },
        kind: 'spell',
        element: 'water',
      },
      {
        _id: 'magic-2',
        name: 'Ley Theory',
        slug: { current: 'ley-theory' },
        kind: 'principle',
      },
    ])

    const page = await MagicsPage({
      searchParams: Promise.resolve({ kind: 'spell' }),
    })
    render(page)

    expect(screen.getByText('Showing 2 of 2')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Clear filters/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Arcane Bolt/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Tidal Ring/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Ley Theory/i })).not.toBeInTheDocument()
    expect(document.querySelector('button[data-element-filter="all"]')).not.toBeNull()
    expect(document.querySelector('button[data-element-filter="fire"]')).not.toBeNull()
  })

  it('falls back to all sections when kind is invalid', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'magic-1',
        name: 'Arcane Bolt',
        slug: { current: 'arcane-bolt' },
        kind: 'spell',
        element: 'fire',
      },
      {
        _id: 'magic-2',
        name: 'Ley Theory',
        slug: { current: 'ley-theory' },
        kind: 'principle',
      },
    ])

    const page = await MagicsPage({
      searchParams: Promise.resolve({ kind: 'invalid-kind' }),
    })
    render(page)

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('link', { name: /Arcane Bolt/i })).toHaveAttribute('href', '/en/magics/arcane-bolt')
    expect(screen.getByRole('link', { name: /Ley Theory/i })).toHaveAttribute('href', '/en/magics/ley-theory')
    expect(screen.queryByText('Filters')).not.toBeInTheDocument()
  })
})
