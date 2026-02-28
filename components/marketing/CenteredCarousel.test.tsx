/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
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

vi.mock("@/components/i18n/LocalizedLink", () => ({
  LocalizedLink: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
    [key: string]: unknown
  }) => (
    <a href={`/en${href}`} {...props}>
      {children}
    </a>
  ),
}))

import { CenteredCarousel } from "./CenteredCarousel"

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

function activeDotIndex() {
  return getDots().findIndex((dot) => dot.className.includes("coverflow-dot--active"))
}

describe("CenteredCarousel", () => {
  it("renders nothing when items are empty", () => {
    const { container } = render(<CenteredCarousel items={[]} />)
    expect(container.innerHTML).toBe("")
  })

  it("shows dots and clamps to max 5 items", () => {
    render(<CenteredCarousel items={makeItems(6)} />)
    expect(getDots()).toHaveLength(5)
  })

  it("jumps to selected dot when clicking pagination", async () => {
    const user = userEvent.setup()
    render(<CenteredCarousel items={makeItems(4)} />)

    const dot = screen.getByRole("button", { name: "Go to Item 3" })
    await user.click(dot)

    expect(activeDotIndex()).toBe(2)
  })

  it("clicking a non-center card makes it active instead of navigating", async () => {
    const user = userEvent.setup()
    const { container } = render(<CenteredCarousel items={makeItems(4)} />)

    const cards = container.querySelectorAll<HTMLAnchorElement>(".coverflow-card")
    // Click a side card (index 1) 鈥?should become active, not navigate
    await user.click(cards[1])
    expect(activeDotIndex()).toBe(1)
  })
  it("resets auto-scroll timing after manual selection to avoid double jumps", async () => {
    vi.useFakeTimers()

    try {
      render(<CenteredCarousel items={makeItems(4)} />)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(4900)
      })
      fireEvent.click(screen.getByRole("button", { name: "Go to Item 3" }))
      expect(activeDotIndex()).toBe(2)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(150)
      })
      expect(activeDotIndex()).toBe(2)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5100)
      })
      expect(activeDotIndex()).toBe(3)
    } finally {
      vi.useRealTimers()
    }
  })
})


