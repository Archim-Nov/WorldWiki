/** @vitest-environment jsdom */
/* eslint-disable @next/next/no-html-link-for-pages */

import "@testing-library/jest-dom/vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

import { ViewTransitionRouter } from "./ViewTransitionRouter"

type StartViewTransition = (callback: () => void | Promise<void>) => {
  finished: Promise<void>
}

describe("ViewTransitionRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, "", "/countries")
    document.cookie = "worldwiki-locale=zh-CN; path=/"
  })

  afterEach(() => {
    cleanup()
    delete (
      document as Document & { startViewTransition?: StartViewTransition }
    ).startViewTransition
    delete document.documentElement.dataset.viewTransition
  })

  it("intercepts same-origin link clicks and routes via startViewTransition", () => {
    const startViewTransitionMock = vi.fn((callback: () => void) => {
      callback()
      return { finished: Promise.resolve() }
    })
    ;(
      document as Document & { startViewTransition?: StartViewTransition }
    ).startViewTransition = startViewTransitionMock

    render(
      <>
        <ViewTransitionRouter />
        <a href="/stories">Go stories</a>
      </>
    )

    fireEvent.click(screen.getByRole("link", { name: "Go stories" }))

    expect(document.documentElement.dataset.viewTransition).toBe("enabled")
    expect(startViewTransitionMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith("/zh-CN/stories")
  })

  it("skips external links", () => {
    const startViewTransitionMock = vi.fn((callback: () => void) => {
      callback()
      return { finished: Promise.resolve() }
    })
    ;(
      document as Document & { startViewTransition?: StartViewTransition }
    ).startViewTransition = startViewTransitionMock

    render(
      <>
        <ViewTransitionRouter />
        <a href="https://example.com">External</a>
      </>
    )

    fireEvent.click(screen.getByRole("link", { name: "External" }))

    expect(startViewTransitionMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("skips modified clicks", () => {
    const startViewTransitionMock = vi.fn((callback: () => void) => {
      callback()
      return { finished: Promise.resolve() }
    })
    ;(
      document as Document & { startViewTransition?: StartViewTransition }
    ).startViewTransition = startViewTransitionMock

    render(
      <>
        <ViewTransitionRouter />
        <a href="/regions">Go regions</a>
      </>
    )

    fireEvent.click(screen.getByRole("link", { name: "Go regions" }), {
      ctrlKey: true,
    })

    expect(startViewTransitionMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("routes with locale prefix even when view transitions are unavailable", () => {
    render(
      <>
        <ViewTransitionRouter />
        <a href="/regions">Go regions</a>
      </>
    )

    fireEvent.click(screen.getByRole("link", { name: "Go regions" }))
    expect(pushMock).toHaveBeenCalledWith("/zh-CN/regions")
  })
})
