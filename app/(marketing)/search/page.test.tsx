/** @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}))

vi.mock('@/lib/sanity/client', () => ({
  client: {
    fetch: fetchMock,
  },
}))

vi.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
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

import SearchPage from './page'

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows prompt when keyword is empty', async () => {
    const page = await SearchPage({
      searchParams: Promise.resolve({}),
    })
    render(page)

    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders search results and calls sanity fetch with wildcard term', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'hero-1',
        _type: 'hero',
        slug: { current: 'arthur' },
        name: 'Arthur',
        portrait: 'https://example.com/arthur.png',
      },
    ])

    const page = await SearchPage({
      searchParams: Promise.resolve({ q: 'arthur king' }),
    })
    render(page)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1]).toEqual({
      term: '*arthur*king*',
      limit: 24,
    })
    expect(screen.getByText(/arthur king/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Arthur/i })).toHaveAttribute(
      'href',
      '/en/champions/arthur'
    )
  })

  it('shows empty state when no result matched', async () => {
    fetchMock.mockResolvedValue([])

    const page = await SearchPage({
      searchParams: Promise.resolve({ q: 'notfound' }),
    })
    render(page)

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(screen.getByText(/notfound/i)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('uses the first keyword when q is an array', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'hero-1',
        _type: 'hero',
        slug: { current: 'arthur' },
        name: 'Arthur',
      },
    ])

    const page = await SearchPage({
      searchParams: Promise.resolve({ q: ['arthur king', 'ignored'] }),
    })
    render(page)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1]).toEqual({
      term: '*arthur*king*',
      limit: 24,
    })
    expect(screen.getByRole('link', { name: /Arthur/i })).toHaveAttribute(
      'href',
      '/en/champions/arthur'
    )
  })

  it('does not fetch when keyword is only whitespace', async () => {
    const page = await SearchPage({
      searchParams: Promise.resolve({ q: '   ' }),
    })
    render(page)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders magic and organization results with localized links', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'magic-1',
        _type: 'magic',
        slug: { current: 'ember-gate' },
        name: 'Ember Gate',
        kind: 'spell',
        element: 'fire',
      },
      {
        _id: 'org-1',
        _type: 'country',
        slug: { current: 'order-of-dawn' },
        name: 'Order of Dawn',
        kind: 'organization',
      },
    ])

    const page = await SearchPage({
      searchParams: Promise.resolve({ q: 'order fire' }),
    })
    render(page)

    expect(screen.getByRole('link', { name: /Order of Dawn/i })).toHaveAttribute(
      'href',
      '/en/countries/order-of-dawn'
    )
    expect(screen.getByRole('link', { name: /Ember Gate/i })).toHaveAttribute(
      'href',
      '/en/magics/ember-gate'
    )
  })
})
