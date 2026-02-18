/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { createClientMock, getUserMock, redirectMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getUserMock: vi.fn(),
  redirectMock: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}))

vi.mock("@/components/layout", () => ({
  Header: () => <header data-testid="header" />,
  Footer: () => <footer data-testid="footer" />,
  PageTransition: ({ children }: { children: ReactNode }) => (
    <div data-testid="page-transition">{children}</div>
  ),
}))

import DashboardLayout from "./layout"

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    createClientMock.mockResolvedValue({
      auth: {
        getUser: getUserMock,
      },
    })

    redirectMock.mockImplementation((path: string) => {
      throw new Error(`redirect:${path}`)
    })
  })

  afterEach(() => {
    cleanup()
  })

  it("renders layout with PageTransition when user is authenticated", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: { id: "user-1" },
      },
    })

    const tree = await DashboardLayout({
      children: <section>dashboard-content</section>,
    })
    render(tree)

    expect(screen.getByTestId("header")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
    expect(screen.getByTestId("page-transition")).toBeInTheDocument()
    expect(screen.getByText("dashboard-content")).toBeInTheDocument()
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it("redirects to /login when no authenticated user", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: null,
      },
    })

    await expect(
      DashboardLayout({
        children: <section>dashboard-content</section>,
      })
    ).rejects.toThrow("redirect:/login")
    expect(redirectMock).toHaveBeenCalledWith("/login")
  })
})
