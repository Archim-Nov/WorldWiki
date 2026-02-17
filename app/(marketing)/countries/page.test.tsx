/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import userEvent from "@testing-library/user-event"
import { cleanup, render, screen } from "@testing-library/react"
import type { ElementType, ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}))

vi.mock("@/lib/sanity/client", () => ({
  client: {
    fetch: fetchMock,
  },
}))

vi.mock("@/components/marketing/ScrollReveal", () => ({
  ScrollReveal: ({
    children,
    as: Tag = "div",
  }: {
    children: ReactNode
    as?: ElementType
  }) => <Tag>{children}</Tag>,
}))

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

import CountriesPage from "./page"

describe("CountriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("renders empty state when there are no entries", async () => {
    fetchMock.mockResolvedValue([])
    const page = await CountriesPage()
    render(page)

    expect(
      screen.getByText("暂无国家或组织内容，请先在 Studio 中创建。")
    ).toBeInTheDocument()
  })

  it("switches sections with buttons without refetching", async () => {
    fetchMock.mockResolvedValue([
      {
        _id: "country-1",
        name: "Avalon",
        slug: { current: "avalon" },
        kind: "nation",
      },
      {
        _id: "org-1",
        name: "Order of Dawn",
        slug: { current: "order-of-dawn" },
        kind: "organization",
      },
    ])
    const page = await CountriesPage()
    render(page)
    const user = userEvent.setup()

    expect(screen.getByRole("button", { name: "全部" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByRole("button", { name: "国家" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    expect(screen.getByRole("button", { name: "组织" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    expect(screen.getByRole("heading", { name: "国家" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "组织" })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole("button", { name: "组织" }))

    expect(screen.queryByRole("heading", { name: "国家" })).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "组织" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "组织" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("shows only organization section when filtered by search params", async () => {
    fetchMock.mockResolvedValue([
      {
        _id: "country-1",
        name: "Avalon",
        slug: { current: "avalon" },
        kind: "nation",
      },
      {
        _id: "org-1",
        name: "Order of Dawn",
        slug: { current: "order-of-dawn" },
        kind: "organization",
      },
    ])
    const page = await CountriesPage({
      searchParams: Promise.resolve({ kind: "organization" }),
    })
    render(page)

    expect(screen.queryByRole("heading", { name: "国家" })).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "组织" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Order of Dawn/i })).toHaveAttribute(
      "href",
      "/countries/order-of-dawn"
    )
  })

  it("falls back to all sections when kind is invalid", async () => {
    fetchMock.mockResolvedValue([
      {
        _id: "country-1",
        name: "Avalon",
        slug: { current: "avalon" },
        kind: "nation",
      },
      {
        _id: "org-1",
        name: "Order of Dawn",
        slug: { current: "order-of-dawn" },
        kind: "organization",
      },
    ])

    const page = await CountriesPage({
      searchParams: Promise.resolve({ kind: "bad-value" }),
    })
    render(page)

    const selectedFilterButton = screen
      .getAllByRole("button")
      .find((button) => button.getAttribute("aria-pressed") === "true")
    expect(selectedFilterButton).toBeDefined()
    expect(screen.getByRole("link", { name: /Avalon/i })).toHaveAttribute(
      "href",
      "/countries/avalon"
    )
    expect(screen.getByRole("link", { name: /Order of Dawn/i })).toHaveAttribute(
      "href",
      "/countries/order-of-dawn"
    )
  })
})
