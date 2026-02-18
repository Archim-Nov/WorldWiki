/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ScrollHeader } from "./ScrollHeader"

describe("ScrollHeader", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    })

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0)
      return 0
    })
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("hides on downward scroll past threshold and shows when scrolling up", async () => {
    render(
      <ScrollHeader>
        <div>content</div>
      </ScrollHeader>
    )

    const header = screen.getByText("content").closest("header")
    expect(header).toHaveStyle({ transform: "translateY(0)" })

    window.scrollY = 120
    window.dispatchEvent(new Event("scroll"))
    await waitFor(() => {
      expect(header).toHaveStyle({ transform: "translateY(-100%)" })
    })

    window.scrollY = 100
    window.dispatchEvent(new Event("scroll"))
    await waitFor(() => {
      expect(header).toHaveStyle({ transform: "translateY(0)" })
    })
  })

  it("stays visible when scroll is below threshold", async () => {
    render(
      <ScrollHeader>
        <div>content</div>
      </ScrollHeader>
    )

    const header = screen.getByText("content").closest("header")
    window.scrollY = 50
    window.dispatchEvent(new Event("scroll"))

    await waitFor(() => {
      expect(header).toHaveStyle({ transform: "translateY(0)" })
    })
  })
})
