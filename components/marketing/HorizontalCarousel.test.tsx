/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
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

import { HorizontalCarousel } from "./HorizontalCarousel"

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

describe("HorizontalCarousel", () => {
  it("renders all items as links", () => {
    render(<HorizontalCarousel items={makeItems(4)} />)

    expect(screen.getAllByRole("link")).toHaveLength(4)
  })

  it("updates nav button state from scroll metrics and scrolls by page", async () => {
    const user = userEvent.setup()
    const { container } = render(<HorizontalCarousel items={makeItems(4)} />)
    const track = container.querySelector("div.overflow-x-auto") as HTMLDivElement
    const leftButton = screen.getByRole("button", { name: "Scroll left" })
    const rightButton = screen.getByRole("button", { name: "Scroll right" })

    Object.defineProperty(track, "clientWidth", {
      configurable: true,
      value: 300,
    })
    Object.defineProperty(track, "scrollWidth", {
      configurable: true,
      value: 900,
    })
    Object.defineProperty(track, "scrollLeft", {
      configurable: true,
      writable: true,
      value: 0,
    })
    const scrollByMock = vi.fn(({ left }: { left: number }) => {
      track.scrollLeft += left
      track.dispatchEvent(new Event("scroll"))
    })
    Object.defineProperty(track, "scrollBy", {
      configurable: true,
      value: scrollByMock,
    })

    window.dispatchEvent(new Event("resize"))
    await waitFor(() => {
      expect(leftButton).toBeDisabled()
      expect(rightButton).toBeEnabled()
    })

    await user.click(rightButton)
    expect(scrollByMock).toHaveBeenCalledWith({ left: 300, behavior: "smooth" })
    expect(leftButton).toBeEnabled()

    track.scrollLeft = 600
    track.dispatchEvent(new Event("scroll"))
    await waitFor(() => {
      expect(rightButton).toBeDisabled()
    })
  })
})
