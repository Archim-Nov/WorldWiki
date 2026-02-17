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
    const { container } = render(<ThemeToggle />)

    let toggleButton: HTMLButtonElement | null = null
    await waitFor(() => {
      toggleButton = container.querySelector("button[aria-label]")
      expect(toggleButton).not.toBeNull()
    })

    await user.click(toggleButton!)
    expect(container.querySelectorAll("button")).toHaveLength(4)

    const buttons = Array.from(container.querySelectorAll("button"))
    await user.click(buttons[2])
    expect(setThemeMock).toHaveBeenCalledWith("dark")
    expect(container.querySelectorAll("button")).toHaveLength(1)
  })

  it("closes menu when clicking outside", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <div>
        <ThemeToggle />
        <button type="button">outside</button>
      </div>
    )

    let toggleButton: HTMLButtonElement | null = null
    await waitFor(() => {
      toggleButton = container.querySelector("button[aria-label]")
      expect(toggleButton).not.toBeNull()
    })

    await user.click(toggleButton!)
    expect(container.querySelectorAll("button")).toHaveLength(5)

    await user.click(screen.getByRole("button", { name: "outside" }))
    expect(container.querySelectorAll("button")).toHaveLength(2)
  })
})
