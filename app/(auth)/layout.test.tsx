/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/components/layout", () => ({
  Header: () => <header data-testid="header" />,
  Footer: () => <footer data-testid="footer" />,
  PageTransition: ({ children }: { children: ReactNode }) => (
    <div data-testid="page-transition">{children}</div>
  ),
}))

import AuthLayout from "./layout"

describe("AuthLayout", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders header/footer and wraps content with PageTransition", () => {
    render(
      <AuthLayout>
        <section>auth-content</section>
      </AuthLayout>
    )

    expect(screen.getByTestId("header")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
    expect(screen.getByTestId("page-transition")).toBeInTheDocument()
    expect(screen.getByText("auth-content")).toBeInTheDocument()
  })
})
