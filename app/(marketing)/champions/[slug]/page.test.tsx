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

import HeroDetailPage from "./page"

describe("HeroDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("renders hero profile, bio, and related story links", async () => {
    fetchMock.mockResolvedValueOnce({
      _id: "hero-1",
      name: "Arthur",
      title: "Knight of Dawn",
      slug: { current: "arthur" },
      portrait: "https://example.com/arthur.jpg",
      faction: "Round Table",
      roles: ["Tank", "Leader"],
      region: {
        name: "Camelot",
        slug: { current: "camelot" },
      },
      country: {
        name: "Britannia",
        slug: { current: "britannia" },
      },
      bio: [
        {
          _type: "block",
          _key: "b1",
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", _key: "c1", text: "Arthur bio", marks: [] }],
        },
      ],
      linkedRefs: [],
      relatedHeroes: [
        { _id: "hero-2", name: "Lancelot", slug: { current: "lancelot" } },
        { _id: "hero-3", name: "Morgana", slug: { current: "morgana" } },
        { _id: "hero-4", name: "Gawain", slug: { current: "gawain" } },
      ],
      relatedStories: [
        {
          _id: "story-1",
          title: "Battle of Dawn",
          slug: { current: "battle-of-dawn" },
          coverImage: "https://example.com/story.jpg",
        },
      ],
    })

    const page = await HeroDetailPage({
      params: Promise.resolve({ slug: "arthur" }),
    })
    render(page)

    expect(screen.getByRole("heading", { name: "Arthur" })).toBeInTheDocument()
    expect(screen.getByText("Knight of Dawn")).toBeInTheDocument()
    expect(screen.getAllByText("Arthur bio").length).toBeGreaterThan(0)
    expect(screen.getByRole("link", { name: "Camelot" })).toHaveAttribute(
      "href",
      "/regions/camelot"
    )
    expect(screen.getByRole("link", { name: "Britannia" })).toHaveAttribute(
      "href",
      "/countries/britannia"
    )
    expect(
      screen.getByRole("heading", { name: "Battle of Dawn" })
    ).toBeInTheDocument()
  })

  it("renders empty-state text when bio and stories are missing", async () => {
    fetchMock.mockResolvedValueOnce({
      _id: "hero-5",
      name: "Merlin",
      slug: { current: "merlin" },
      relatedHeroes: [
        { _id: "hero-2", name: "Lancelot", slug: { current: "lancelot" } },
        { _id: "hero-3", name: "Morgana", slug: { current: "morgana" } },
        { _id: "hero-4", name: "Gawain", slug: { current: "gawain" } },
      ],
      relatedStories: [],
    })

    const page = await HeroDetailPage({
      params: Promise.resolve({ slug: "merlin" }),
    })
    render(page)

    expect(
      screen.getByText("传记正文将在后续阶段完成富文本渲染与段落排版。")
    ).toBeInTheDocument()
    expect(screen.getByText("暂无关联短篇故事，可在故事条目中建立关联。")).toBeInTheDocument()
  })

  it("calls notFound when hero does not exist", async () => {
    fetchMock.mockResolvedValueOnce(null)

    await expect(
      HeroDetailPage({ params: Promise.resolve({ slug: "missing" }) })
    ).rejects.toThrow("not-found")
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})
