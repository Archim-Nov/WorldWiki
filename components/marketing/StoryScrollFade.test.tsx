/** @vitest-environment jsdom */

import { render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { StoryScrollFade } from "./StoryScrollFade"

describe("StoryScrollFade", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="story-detail"></div>'

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 1000,
    })
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
    vi.restoreAllMocks()
    document.body.innerHTML = ""
  })

  it("updates --story-fade based on scroll position and clamps value", async () => {
    render(<StoryScrollFade />)
    const root = document.querySelector(".story-detail") as HTMLElement

    window.scrollY = 350
    window.dispatchEvent(new Event("scroll"))
    await waitFor(() => {
      expect(root.style.getPropertyValue("--story-fade")).toBe("0.500")
    })

    window.scrollY = 3000
    window.dispatchEvent(new Event("scroll"))
    await waitFor(() => {
      expect(root.style.getPropertyValue("--story-fade")).toBe("1.000")
    })
  })

  it("does nothing when root element is absent", () => {
    document.body.innerHTML = ""
    expect(() => render(<StoryScrollFade />)).not.toThrow()
  })
})
