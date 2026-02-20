/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { mockUseTheme, setThemeMock } = vi.hoisted(() => ({
  mockUseTheme: vi.fn(),
  setThemeMock: vi.fn(),
}))

vi.mock("next-themes", () => ({
  useTheme: mockUseTheme,
}))

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const messages: Record<string, string> = {
      buttonAria: "Toggle theme",
      "options.light": "Light",
      "options.dark": "Dark",
      "options.system": "System",
    }

    return (key: string) => messages[key] ?? key
  },
}))

import { ThemeToggle } from "./ThemeToggle"

describe("ThemeToggle", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTheme.mockReturnValue({
      theme: "system",
      setTheme: setThemeMock,
    })
  })

  it("opens menu and selects a theme option", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const toggleButton = await screen.findByRole("button", { name: "Toggle theme" })
    await user.click(toggleButton)

    const darkOption = screen.getByRole("button", { name: "Dark" })
    await user.click(darkOption)

    expect(setThemeMock).toHaveBeenCalledWith("dark")
    expect(screen.queryByRole("button", { name: "Dark" })).toBeNull()
  })

  it("closes menu when clicking outside", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <ThemeToggle />
        <button type="button">outside</button>
      </div>
    )

    const toggleButton = await screen.findByRole("button", { name: "Toggle theme" })
    await user.click(toggleButton)
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "outside" }))
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Dark" })).toBeNull()
    })
  })
})
