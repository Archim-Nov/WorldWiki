/** @vitest-environment jsdom */
/* eslint-disable @next/next/no-img-element */

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { ElementType, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}))

const regionMessages = {
  eyebrow: 'Regions',
  title: 'Region Gallery',
  lead: 'Use maps and environments as clues to enter each fragment of the world.',
  empty: 'No region entries yet. Create entries in Studio first.',
}

vi.mock('@/lib/sanity/client', () => ({
  client: {
    fetch: fetchMock,
  },
}))

vi.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
  getTranslations: async () => (key: string) => regionMessages[key as keyof typeof regionMessages] ?? key,
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

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    [key: string]: unknown
  }) => <img src={src} alt={alt} {...props} />,
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

import RegionsPage from './page'

describe('RegionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders empty state when there are no regions', async () => {
    fetchMock.mockResolvedValue([])
    const page = await RegionsPage()
    render(page)

    expect(screen.getByRole('heading', { level: 1, name: regionMessages.title })).toBeInTheDocument()
    expect(screen.getByText(regionMessages.empty)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders region cards and links', async () => {
    fetchMock.mockResolvedValue([
      {
        _id: 'region-1',
        name: 'Frost Vale',
        slug: { current: 'frost-vale' },
        summary: 'Frozen frontier',
        country: { name: 'Avalon', slug: { current: 'avalon' } },
      },
    ])

    const page = await RegionsPage()
    render(page)

    expect(screen.getByRole('heading', { level: 1, name: regionMessages.title })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Frost Vale/i })).toHaveAttribute('href', '/en/regions/frost-vale')
    expect(screen.getByText('Avalon')).toBeInTheDocument()
    expect(screen.getByText('Frozen frontier')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
