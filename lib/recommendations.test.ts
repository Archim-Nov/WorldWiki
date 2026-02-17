import { describe, expect, it } from "vitest"

import { placeholders } from "@/lib/placeholders"
import {
  addRecommendations,
  type RecommendationItem,
  toRecommendation,
  typeLabels,
  typeRoutes,
} from "@/lib/recommendations"

describe("toRecommendation", () => {
  it("returns null when required fields are missing", () => {
    expect(toRecommendation({})).toBeNull()
    expect(toRecommendation({ _type: "hero", _id: "hero-1" })).toBeNull()
    expect(
      toRecommendation({
        _type: "hero",
        _id: "hero-1",
        slug: { current: "arthur" },
      })
    ).toBeNull()
  })

  it("builds hero recommendation with portrait image", () => {
    const result = toRecommendation({
      _id: "hero-1",
      _type: "hero",
      slug: { current: "arthur" },
      name: "Arthur",
      portrait: "https://example.com/arthur.png",
    })

    expect(result).toEqual({
      _id: "hero-1",
      title: "Arthur",
      href: `/${typeRoutes.hero}/arthur`,
      image: "https://example.com/arthur.png",
      typeLabel: typeLabels.hero,
    })
  })

  it("uses type override and fallback placeholder image", () => {
    const result = toRecommendation(
      {
        _id: "region-1",
        slug: { current: "north" },
        title: "Northern Reach",
      },
      "region"
    )

    expect(result).toEqual({
      _id: "region-1",
      title: "Northern Reach",
      href: `/${typeRoutes.region}/north`,
      image: placeholders.region,
      typeLabel: typeLabels.region,
    })
  })

  it("maps magic recommendation with cover image", () => {
    const result = toRecommendation({
      _id: "magic-1",
      _type: "magic",
      slug: { current: "arcane-bolt" },
      name: "Arcane Bolt",
      coverImage: "https://example.com/bolt.jpg",
    })

    expect(result).toEqual({
      _id: "magic-1",
      title: "Arcane Bolt",
      href: `/${typeRoutes.magic}/arcane-bolt`,
      image: "https://example.com/bolt.jpg",
      typeLabel: typeLabels.magic,
    })
  })
})

describe("addRecommendations", () => {
  it("adds unique recommendations up to the limit", () => {
    const list: RecommendationItem[] = []
    const seen = new Set<string>()

    addRecommendations(
      list,
      seen,
      [
        {
          _id: "hero-1",
          _type: "hero",
          slug: { current: "arthur" },
          name: "Arthur",
        },
        {
          _id: "hero-1",
          _type: "hero",
          slug: { current: "arthur-alt" },
          name: "Arthur Alt",
        },
        {
          _id: "hero-2",
          _type: "hero",
          slug: { current: "lyra" },
          name: "Lyra",
        },
        {
          _id: "hero-3",
          _type: "hero",
          slug: { current: "doran" },
          name: "Doran",
        },
      ],
      undefined,
      2
    )

    expect(list).toHaveLength(2)
    expect(list.map((item) => item._id)).toEqual(["hero-1", "hero-2"])
    expect(seen.size).toBe(2)
  })
})
