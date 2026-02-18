/** @vitest-environment jsdom */
/* eslint-disable @next/next/no-img-element */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import type { ElementType, ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}))

vi.mock("@/lib/sanity/client", () => ({
  client: {
    fetch: fetchMock,
  },
}))

vi.mock("next/link", () => ({
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

vi.mock("next/image", () => ({
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

vi.mock("@/components/marketing/ScrollReveal", () => ({
  ScrollReveal: ({
    children,
    as: Tag = "div",
  }: {
    children: ReactNode
    as?: ElementType
  }) => <Tag>{children}</Tag>,
}))

import StoriesPage from "./page"

describe("StoriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("renders empty state when there are no stories", async () => {
    fetchMock.mockResolvedValue([])
    const page = await StoriesPage()
    render(page)

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("renders stories list with links", async () => {
    fetchMock.mockResolvedValue([
      {
        _id: "story-1",
        title: "Ashes at Dawn",
        slug: { current: "ashes-at-dawn" },
      },
      {
        _id: "story-2",
        title: "The Last Beacon",
        slug: { current: "the-last-beacon" },
      },
    ])

    const page = await StoriesPage()
    render(page)

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Ashes at Dawn/i })).toHaveAttribute(
      "href",
      "/stories/ashes-at-dawn"
    )
    expect(screen.getByRole("link", { name: /The Last Beacon/i })).toHaveAttribute(
      "href",
      "/stories/the-last-beacon"
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
