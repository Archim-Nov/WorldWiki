/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

const recommendationMessages = {
  title: "Related Picks",
  subtitle: "Related Picks",
  empty: "No related content yet.",
  types: {
    hero: "Champion",
    region: "Region",
    country: "Country",
    creature: "Creature",
    story: "Story",
    magic: "Magic",
  },
}

function getByPath(source: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, source)
}

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getTranslations: async () => (key: string) => {
    const value = getByPath(
      recommendationMessages as unknown as Record<string, unknown>,
      key
    )
    return typeof value === "string" ? value : key
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

import { RecommendationGrid } from "./RecommendationGrid"

const items = [
  {
    _id: "1",
    title: "Arthur",
    href: "/champions/arthur",
    image: "https://example.com/1.jpg",
    typeLabel: "hero",
  },
  {
    _id: "2",
    title: "Lyra",
    href: "/champions/lyra",
    image: "https://example.com/2.jpg",
    typeLabel: "hero",
  },
  {
    _id: "3",
    title: "North",
    href: "/regions/north",
    image: "https://example.com/3.jpg",
    typeLabel: "region",
  },
  {
    _id: "4",
    title: "Avalon",
    href: "/countries/avalon",
    image: "https://example.com/4.jpg",
    typeLabel: "country",
  },
]

describe("RecommendationGrid", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders at most 3 recommendation cards", async () => {
    const page = await RecommendationGrid({ items })
    render(page)

    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute("href", "/en/champions/arthur")
    expect(links[2]).toHaveAttribute("href", "/en/regions/north")
    expect(screen.queryByRole("link", { name: /Avalon/i })).not.toBeInTheDocument()
  })

  it("renders custom title and subtitle", async () => {
    const page = await RecommendationGrid({
      title: "You May Like",
      subtitle: "Custom Picks",
      items: items.slice(0, 1),
    })
    render(page)

    expect(screen.getByRole("heading", { level: 2, name: "You May Like" })).toBeInTheDocument()
    expect(screen.getByText("Custom Picks")).toBeInTheDocument()
  })

  it("renders empty state when no items", async () => {
    const page = await RecommendationGrid({ items: [] })
    render(page)

    expect(screen.getByText("No related content yet.")).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
