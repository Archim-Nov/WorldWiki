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

import CreatureDetailPage from "./page"

describe("CreatureDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("renders creature details, ecology content, and region links", async () => {
    fetchMock.mockResolvedValueOnce({
      _id: "creature-1",
      name: "Silver Wolf",
      category: "animal",
      species: "Lupus Argent",
      portrait: "https://example.com/wolf.jpg",
      region: { name: "Northern Peaks", slug: { current: "northern-peaks" } },
      country: { name: "Avalon", slug: { current: "avalon" } },
      bio: [
        {
          _type: "block",
          _key: "b1",
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", _key: "c1", text: "生态描述正文", marks: [] }],
        },
      ],
      relatedStories: [
        { _id: "story-1", title: "Moon Hunt", slug: { current: "moon-hunt" } },
        { _id: "story-2", title: "Snow Trail", slug: { current: "snow-trail" } },
        { _id: "story-3", title: "Last Fang", slug: { current: "last-fang" } },
      ],
      linkedRefs: [],
    })

    const page = await CreatureDetailPage({
      params: Promise.resolve({ slug: "silver-wolf" }),
    })
    render(page)

    expect(
      screen.getByRole("heading", { name: "Silver Wolf" })
    ).toBeInTheDocument()
    expect(screen.getAllByText("动物").length).toBeGreaterThan(0)
    expect(screen.getByText("生态描述正文")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Northern Peaks" })).toHaveAttribute(
      "href",
      "/regions/northern-peaks"
    )
    expect(screen.getByRole("link", { name: "Avalon" })).toHaveAttribute(
      "href",
      "/countries/avalon"
    )
  })

  it("renders fallback ecology text when bio is missing", async () => {
    fetchMock.mockResolvedValueOnce({
      _id: "creature-2",
      name: "Stone Ent",
      category: "element",
      relatedStories: [
        { _id: "story-1", title: "Root War", slug: { current: "root-war" } },
        { _id: "story-2", title: "Deep Soil", slug: { current: "deep-soil" } },
        { _id: "story-3", title: "Echo Bark", slug: { current: "echo-bark" } },
      ],
      linkedRefs: [],
    })

    const page = await CreatureDetailPage({
      params: Promise.resolve({ slug: "stone-ent" }),
    })
    render(page)

    expect(
      screen.getByText("暂无生态描述。")
    ).toBeInTheDocument()
  })

  it("calls notFound when creature does not exist", async () => {
    fetchMock.mockResolvedValueOnce(null)

    await expect(
      CreatureDetailPage({ params: Promise.resolve({ slug: "missing" }) })
    ).rejects.toThrow("not-found")
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})
