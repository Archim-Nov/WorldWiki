/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { fetchMock, notFoundMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("not-found")
  }),
}))

vi.mock("@/lib/sanity/client", () => ({
  client: {
    fetch: fetchMock,
  },
}))

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
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

import CountryDetailPage from "./page"

describe("CountryDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("renders organization labels for organization entries", async () => {
    fetchMock.mockResolvedValueOnce({
      _id: "country-1",
      name: "Order of Dawn",
      kind: "organization",
      featuredRegions: [
        {
          _id: "region-1",
          name: "Harbor District",
          slug: { current: "harbor-district" },
        },
        {
          _id: "region-2",
          name: "Cathedral Ward",
          slug: { current: "cathedral-ward" },
        },
        {
          _id: "region-3",
          name: "Iron Docks",
          slug: { current: "iron-docks" },
        },
      ],
    })

    const page = await CountryDetailPage({
      params: Promise.resolve({ slug: "order-of-dawn" }),
    })
    render(page)

    expect(
      screen.getByRole("heading", { name: "Order of Dawn" })
    ).toBeInTheDocument()
    expect(screen.getByText("Organization Profile")).toBeInTheDocument()
    expect(screen.getByText("Branches")).toBeInTheDocument()
    const harborLinks = screen.getAllByRole("link", { name: /Harbor District/i })
    expect(harborLinks[0]).toHaveAttribute("href", "/regions/harbor-district")
  })

  it("falls back to nation labels when kind is missing", async () => {
    fetchMock.mockResolvedValueOnce({
      _id: "country-2",
      name: "Avalon",
      featuredRegions: [
        {
          _id: "region-9",
          name: "Capital Ring",
          slug: { current: "capital-ring" },
        },
        {
          _id: "region-10",
          name: "Old Harbor",
          slug: { current: "old-harbor" },
        },
        {
          _id: "region-11",
          name: "Sky Market",
          slug: { current: "sky-market" },
        },
      ],
    })

    const page = await CountryDetailPage({
      params: Promise.resolve({ slug: "avalon" }),
    })
    render(page)

    expect(screen.getByText("Country Atlas")).toBeInTheDocument()
    expect(screen.getByText("Regions")).toBeInTheDocument()
  })

  it("calls notFound when country does not exist", async () => {
    fetchMock.mockResolvedValueOnce(null)

    await expect(
      CountryDetailPage({ params: Promise.resolve({ slug: "missing" }) })
    ).rejects.toThrow("not-found")
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})
