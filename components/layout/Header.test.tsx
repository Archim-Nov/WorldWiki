/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
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

vi.mock("./UserNav", () => ({
  UserNav: () => <span data-testid="user-nav" />,
}))

vi.mock("./ThemeToggle", () => ({
  ThemeToggle: () => <span data-testid="theme-toggle" />,
}))

vi.mock("./ScrollHeader", () => ({
  ScrollHeader: ({ children }: { children: ReactNode }) => (
    <header data-testid="scroll-header">{children}</header>
  ),
}))

import { Header } from "./Header"

describe("Header", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders search form targeting /search with query field", () => {
    const { container } = render(<Header />)

    const form = container.querySelector("form")
    const input = screen.getByRole("searchbox", { name: "搜索" })
    const submit = screen.getByRole("button", { name: "提交搜索" })

    expect(form).toBeInTheDocument()
    expect(form?.getAttribute("action")).toContain("/search")
    expect(form?.getAttribute("method")).toBe("get")
    expect(input).toHaveAttribute("name", "q")
    expect(submit).toBeInTheDocument()
  })
})
