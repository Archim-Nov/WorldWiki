/** @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { cleanup, render, screen } from '@testing-library/react'
import type { ElementType, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}))

const countriesPageMessages = {
  eyebrow: 'Countries',
  title: 'Countries & Organizations',
  lead: 'Enter the world through political entities and organizations.',
  empty: 'No countries or organizations yet. Create entries in Studio first.',
}

const countriesFilterMessages = {
  navAria: 'Switch between countries and organizations',
  all: 'All',
  nation: 'Countries',
  organization: 'Organizations',
  emptyNation: 'No country entries yet.',
  emptyOrganization: 'No organization entries yet.',
  ctaNation: 'Explore country',
  ctaOrganization: 'Explore organization',
  subtitleNation: 'Nations',
  subtitleOrganization: 'Organizations',
}

vi.mock('@/lib/sanity/client', () => ({
  client: {
    fetch: fetchMock,
  },
}))

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => {
    const source = namespace === 'CountriesFilter' ? countriesFilterMessages : countriesPageMessages
    return (key: string) => source[key as keyof typeof source] ?? key
  },
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace: string) => {
    const source = namespace === 'CountriesFilter' ? countriesFilterMessages : countriesPageMessages
    return (key: string) => source[key as keyof typeof source] ?? key
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

import CountriesPage from './page'

describe('CountriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders empty state when there are no entries', async () => {
    fetchMock.mockResolvedValue([])
    const page = await CountriesPage()
    render(page)

    expect(screen.getByText(countriesPageMessages.empty)).toBeInTheDocument()
  })

  it('switches sections with buttons without refetching', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'country-1',
        name: 'Avalon',
        slug: { current: 'avalon' },
        kind: 'nation',
      },
      {
        _id: 'org-1',
        name: 'Order of Dawn',
        slug: { current: 'order-of-dawn' },
        kind: 'organization',
      },
    ])
    const page = await CountriesPage()
    render(page)
    const user = userEvent.setup()

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Countries' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Organizations' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('heading', { name: 'Countries' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Organizations' }).length).toBeGreaterThan(0)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Organizations' }))

    expect(screen.queryByRole('heading', { name: 'Countries' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Organizations' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Organizations' })).toHaveAttribute('aria-pressed', 'true')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows only organization section when filtered by search params', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'country-1',
        name: 'Avalon',
        slug: { current: 'avalon' },
        kind: 'nation',
      },
      {
        _id: 'org-1',
        name: 'Order of Dawn',
        slug: { current: 'order-of-dawn' },
        kind: 'organization',
      },
    ])
    const page = await CountriesPage({
      searchParams: Promise.resolve({ kind: 'organization' }),
    })
    render(page)

    expect(screen.queryByRole('heading', { name: 'Countries' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Organizations' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Order of Dawn/i })).toHaveAttribute(
      'href',
      '/en/countries/order-of-dawn'
    )
  })

  it('falls back to all sections when kind is invalid', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'country-1',
        name: 'Avalon',
        slug: { current: 'avalon' },
        kind: 'nation',
      },
      {
        _id: 'org-1',
        name: 'Order of Dawn',
        slug: { current: 'order-of-dawn' },
        kind: 'organization',
      },
    ])

    const page = await CountriesPage({
      searchParams: Promise.resolve({ kind: 'bad-value' }),
    })
    render(page)

    const selectedFilterButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-pressed') === 'true')
    expect(selectedFilterButton).toBeDefined()
    expect(screen.getByRole('link', { name: /Avalon/i })).toHaveAttribute('href', '/en/countries/avalon')
    expect(screen.getByRole('link', { name: /Order of Dawn/i })).toHaveAttribute(
      'href',
      '/en/countries/order-of-dawn'
    )
  })
})
