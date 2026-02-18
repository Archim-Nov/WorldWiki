/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const { pathnameRef } = vi.hoisted(() => ({
  pathnameRef: { current: "/countries" },
}))

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
}))

import { PageTransition } from "./PageTransition"

describe("PageTransition", () => {
  afterEach(() => {
    cleanup()
    pathnameRef.current = "/countries"
  })

  it("renders wrapper with page-enter class and route key", () => {
    render(
      <PageTransition>
        <div>content</div>
      </PageTransition>
    )

    const wrapper = screen.getByTestId("page-transition")
    expect(wrapper).toHaveClass("page-enter")
    expect(wrapper).toHaveAttribute("data-route-key", "/countries")
  })

  it("updates route key when pathname changes", () => {
    const { rerender } = render(
      <PageTransition>
        <div>content</div>
      </PageTransition>
    )

    const firstWrapper = screen.getByTestId("page-transition")
    pathnameRef.current = "/stories"
    rerender(
      <PageTransition>
        <div>content</div>
      </PageTransition>
    )

    const nextWrapper = screen.getByTestId("page-transition")
    expect(nextWrapper).toHaveAttribute("data-route-key", "/stories")
    expect(nextWrapper).not.toBe(firstWrapper)
  })

  it("renders children inside transition wrapper", () => {
    render(
      <PageTransition>
        <section aria-label="child-section" />
      </PageTransition>
    )

    expect(screen.getByLabelText("child-section")).toBeInTheDocument()
  })
})
