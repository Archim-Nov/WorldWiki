/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { fetchMock, notFoundMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("not-found")
  }),
}))

vi.mock("@/lib/sanity/client", () => ({
  client: {
    fetch: fetchMock,
  },
}))

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
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

import MagicDetailPage from "./page"

describe("MagicDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("renders spell detail content, element, and recommendations", async () => {
    fetchMock
      .mockResolvedValueOnce({
        _id: "magic-1",
        name: "Arcane Bolt",
        kind: "spell",
        element: "fire",
        school: "Arcane",
        summary: "Fast projectile spell",
        details: [],
        relatedHeroes: [
          {
            _id: "hero-1",
            name: "Arthur",
            slug: { current: "arthur" },
          },
        ],
        relatedStories: [],
        linkedRefs: [],
      })
      .mockResolvedValueOnce([])

    const page = await MagicDetailPage({
      params: Promise.resolve({ slug: "arcane-bolt" }),
    })
    render(page)

    expect(screen.getByRole("heading", { name: "Arcane Bolt" })).toBeInTheDocument()
    expect(screen.getByText("法术")).toBeInTheDocument()
    expect(screen.getByText("元素：火")).toBeInTheDocument()
    expect(screen.getByText("Fast projectile spell")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Arthur/i })).toHaveAttribute(
      "href",
      "/champions/arthur"
    )
  })

  it("renders principle branch without element row", async () => {
    fetchMock
      .mockResolvedValueOnce({
        _id: "magic-2",
        name: "Ley Theory",
        kind: "principle",
        school: "Theory",
        summary: "World rule",
        details: [],
        relatedHeroes: [],
        relatedStories: [],
        linkedRefs: [],
      })
      .mockResolvedValueOnce([])

    const page = await MagicDetailPage({
      params: Promise.resolve({ slug: "ley-theory" }),
    })
    render(page)

    expect(screen.getByRole("heading", { name: "Ley Theory" })).toBeInTheDocument()
    expect(screen.getByText("原理")).toBeInTheDocument()
    expect(screen.queryByText(/元素：/)).not.toBeInTheDocument()
  })

  it("calls notFound when magic does not exist", async () => {
    fetchMock.mockResolvedValueOnce(null)

    await expect(
      MagicDetailPage({ params: Promise.resolve({ slug: "missing" }) })
    ).rejects.toThrow("not-found")
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})
