/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ChampionDetailLoading from "./champions/[slug]/loading"
import CountryDetailLoading from "./countries/[slug]/loading"
import CreatureDetailLoading from "./creatures/[slug]/loading"
import MagicDetailLoading from "./magics/[slug]/loading"
import RegionDetailLoading from "./regions/[slug]/loading"
import StoryDetailLoading from "./stories/[slug]/loading"

describe("Detail route loading entries", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders champion loading label", () => {
    render(<ChampionDetailLoading />)
    expect(screen.getByText("Champion Archive")).toBeInTheDocument()
  })

  it("renders country loading label", () => {
    render(<CountryDetailLoading />)
    expect(screen.getByText("Country Atlas")).toBeInTheDocument()
  })

  it("renders region loading label", () => {
    render(<RegionDetailLoading />)
    expect(screen.getByText("Region Stage")).toBeInTheDocument()
  })

  it("renders creature loading label", () => {
    render(<CreatureDetailLoading />)
    expect(screen.getByText("Specimen Sheet")).toBeInTheDocument()
  })

  it("renders magic loading label", () => {
    render(<MagicDetailLoading />)
    expect(screen.getByText("Arcane Codex")).toBeInTheDocument()
  })

  it("renders story loading label", () => {
    render(<StoryDetailLoading />)
    expect(screen.getByText("Short Story")).toBeInTheDocument()
  })
})
