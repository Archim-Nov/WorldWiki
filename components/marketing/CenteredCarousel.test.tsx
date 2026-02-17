/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"

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

import { CenteredCarousel } from "./CenteredCarousel"

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverMock)
})

afterAll(() => {
  vi.unstubAllGlobals()
})

afterEach(() => {
  cleanup()
})

function makeItems(count: number) {
  return Array.from({ length: count }).map((_, index) => ({
    _id: `id-${index + 1}`,
    title: `Item ${index + 1}`,
    href: `/item-${index + 1}`,
    image: `https://example.com/${index + 1}.jpg`,
    typeLabel: "test",
  }))
}

function getDots() {
  return screen.getAllByRole("button", { name: /Go to Item/i })
}

function getNavButtons() {
  const navButtons = screen
    .getAllByRole("button")
    .filter((button) => !button.getAttribute("aria-label"))
  return {
    prev: navButtons[0],
    next: navButtons[1],
  }
}

function activeDotIndex() {
  return getDots().findIndex((dot) => dot.className.includes("bg-primary"))
}

describe("CenteredCarousel", () => {
  it("renders empty state when items are empty", () => {
    const { container } = render(<CenteredCarousel items={[]} />)

    expect(container.querySelector("p")).toBeInTheDocument()
    const navButtons = screen
      .queryAllByRole("button")
      .filter((button) => !button.getAttribute("aria-label"))
    expect(navButtons).toHaveLength(0)
  })

  it("shows controls and clamps dots to max 5 items", () => {
    render(<CenteredCarousel items={makeItems(6)} />)

    const { prev, next } = getNavButtons()
    expect(prev).toBeInTheDocument()
    expect(next).toBeInTheDocument()
    expect(getDots()).toHaveLength(5)
  })

  it("moves active dot with next and prev controls", async () => {
    const user = userEvent.setup()
    render(<CenteredCarousel items={makeItems(4)} />)
    const { prev, next } = getNavButtons()

    expect(activeDotIndex()).toBe(0)

    await user.click(next)
    expect(activeDotIndex()).toBe(1)

    await user.click(prev)
    expect(activeDotIndex()).toBe(0)
  })

  it("jumps to selected dot when clicking pagination", async () => {
    const user = userEvent.setup()
    render(<CenteredCarousel items={makeItems(4)} />)

    const dot = screen.getByRole("button", { name: "Go to Item 3" })
    await user.click(dot)

    expect(activeDotIndex()).toBe(2)
  })

  it("moves carousel when clicking neighbor and far cards", async () => {
    const user = userEvent.setup()
    const { container } = render(<CenteredCarousel items={makeItems(3)} />)

    const cards = container.querySelectorAll<HTMLAnchorElement>(".home-carousel-card")
    expect(cards.length).toBeGreaterThan(11)
    expect(activeDotIndex()).toBe(0)

    await user.click(cards[7])
    expect(activeDotIndex()).toBe(1)

    await user.click(cards[11])
    expect(activeDotIndex()).toBe(2)

    await user.click(cards[7])
    expect(activeDotIndex()).toBe(1)
  })
})
