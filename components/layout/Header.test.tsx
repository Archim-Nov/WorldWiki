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

vi.mock("next-intl", () => ({
  useLocale: () => "zh-CN",
  useTranslations: () => {
    const messages: Record<string, string> = {
      "nav.countries": "Countries",
      "nav.regions": "Regions",
      "nav.creatures": "Creatures",
      "nav.champions": "Champions",
      "nav.magics": "Magics",
      "nav.stories": "Stories",
      "search.placeholder": "Search",
      "search.aria": "Search site",
      "search.submit": "Submit search",
    }

    return (key: string) => messages[key] ?? key
  },
}))

vi.mock("./UserNav", () => ({
  UserNav: () => <span data-testid="user-nav" />,
}))

vi.mock("./ThemeToggle", () => ({
  ThemeToggle: () => <span data-testid="theme-toggle" />,
}))

vi.mock("./LanguageSwitcher", () => ({
  LanguageSwitcher: () => <span data-testid="language-switcher" />,
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

  it("renders localized links and right utility controls", () => {
    const { container } = render(<Header />)

    expect(screen.getByRole("link", { name: "WorldWiki" })).toHaveAttribute("href", "/zh-CN")
    expect(screen.getByRole("link", { name: "Countries" })).toHaveAttribute("href", "/zh-CN/countries")
    expect(screen.getByRole("link", { name: "Regions" })).toHaveAttribute("href", "/zh-CN/regions")
    expect(screen.getByRole("link", { name: "Creatures" })).toHaveAttribute("href", "/zh-CN/creatures")
    expect(screen.getByRole("link", { name: "Champions" })).toHaveAttribute("href", "/zh-CN/champions")
    expect(screen.getByRole("link", { name: "Magics" })).toHaveAttribute("href", "/zh-CN/magics")
    expect(screen.getByRole("link", { name: "Stories" })).toHaveAttribute("href", "/zh-CN/stories")

    const search = screen.getByRole("searchbox", { name: "Search site" })
    const submit = screen.getByRole("button", { name: "Submit search" })
    const form = container.querySelector("form")

    expect(search).toBeInTheDocument()
    expect(search).toHaveAttribute("name", "q")
    expect(submit).toBeInTheDocument()
    expect(form?.getAttribute("action")).toContain("/zh-CN/search")

    expect(screen.getByTestId("language-switcher")).toBeInTheDocument()
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument()
    expect(screen.getByTestId("user-nav")).toBeInTheDocument()
  })
})
