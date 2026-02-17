/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

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

import { ChampionsFilter } from "./ChampionsFilter"

afterEach(() => {
  cleanup()
})

const heroes = [
  {
    _id: "h1",
    name: "Arthur",
    slug: { current: "arthur" },
    country: { name: "Avalon", slug: { current: "avalon" } },
    region: { name: "North", slug: { current: "north" } },
    roles: ["Tank"],
  },
  {
    _id: "h2",
    name: "Lyra",
    slug: { current: "lyra" },
    country: { name: "Avalon", slug: { current: "avalon" } },
    region: { name: "South", slug: { current: "south" } },
    roles: ["Mage"],
  },
  {
    _id: "h3",
    name: "Doran",
    slug: { current: "doran" },
    country: { name: "Boreal", slug: { current: "boreal" } },
    region: { name: "North", slug: { current: "north" } },
    roles: ["Warrior"],
  },
]

describe("ChampionsFilter", () => {
  it("shows all heroes initially", () => {
    render(<ChampionsFilter heroes={heroes} />)

    expect(screen.getByText("Showing 3 of 3")).toBeInTheDocument()
    expect(screen.getAllByRole("link")).toHaveLength(3)
  })

  it("filters heroes by country and region", async () => {
    const user = userEvent.setup()
    render(<ChampionsFilter heroes={heroes} />)

    await user.click(screen.getByRole("button", { name: "Avalon" }))
    expect(screen.getByText("Showing 2 of 3")).toBeInTheDocument()
    expect(screen.getAllByRole("link")).toHaveLength(2)

    await user.click(screen.getByRole("button", { name: "South" }))
    expect(screen.getByText("Showing 1 of 3")).toBeInTheDocument()
    expect(screen.getAllByRole("link")).toHaveLength(1)
    expect(screen.getByRole("link", { name: /Lyra/i })).toBeInTheDocument()
  })

  it("shows empty state for unmatched combination and clears filters", async () => {
    const user = userEvent.setup()
    render(<ChampionsFilter heroes={heroes} />)

    await user.click(screen.getByRole("button", { name: "Boreal" }))
    await user.click(screen.getByRole("button", { name: "North" }))

    expect(screen.getByText("Showing 1 of 3")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "South" }))
    expect(
      screen.getByText(/No champions match the selected filters/i)
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByText("Showing 3 of 3")).toBeInTheDocument()
    expect(screen.getAllByRole("link")).toHaveLength(3)
  })
})
