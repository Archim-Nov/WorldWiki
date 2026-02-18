/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Error from "./error"

describe("Error", () => {
  it("calls reset when retry button is clicked", () => {
    const reset = vi.fn()

    render(
      <Error
        error={new Error("boom")}
        reset={reset}
      />
    )

    fireEvent.click(screen.getByRole("button"))
    expect(reset).toHaveBeenCalledTimes(1)
  })
})
