/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { DetailRouteLoading } from "./DetailRouteLoading"

describe("DetailRouteLoading", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders skeleton shell with provided label", () => {
    render(<DetailRouteLoading label="Story Archive" />)

    expect(screen.getByTestId("detail-route-loading")).toBeInTheDocument()
    expect(screen.getByText("Story Archive")).toBeInTheDocument()
  })
})
