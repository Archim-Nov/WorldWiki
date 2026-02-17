import { describe, expect, it } from "vitest"

import { placeholders } from "@/lib/placeholders"
import {
  buildSearchTerm,
  normalizeSearchKeyword,
  toSearchItem,
} from "@/lib/search"

describe("search helpers", () => {
  it("normalizes keyword spacing", () => {
    expect(normalizeSearchKeyword("  foo   bar  ")).toBe("foo bar")
  })

  it("builds wildcard search term", () => {
    expect(buildSearchTerm("foo bar")).toBe("*foo*bar*")
  })

  it("maps hero document to search item", () => {
    const item = toSearchItem({
      _id: "hero-1",
      _type: "hero",
      slug: { current: "arthur" },
      name: "Arthur",
      portrait: "https://example.com/arthur.png",
    })

    expect(item).toEqual({
      _id: "hero-1",
      type: "hero",
      typeLabel: "英雄",
      href: "/champions/arthur",
      title: "Arthur",
      description: "查看英雄详情",
      image: "https://example.com/arthur.png",
    })
  })

  it("falls back to placeholders and returns null for invalid docs", () => {
    const regionItem = toSearchItem({
      _id: "region-1",
      _type: "region",
      slug: { current: "north" },
      name: "North",
      summary: "Cold area",
    })
    expect(regionItem?.image).toBe(placeholders.region)
    expect(regionItem?.description).toBe("Cold area")

    expect(toSearchItem({ _type: "hero" })).toBeNull()
    expect(
      toSearchItem({
        _id: "x",
        _type: "unknown",
        slug: { current: "x" },
        name: "X",
      })
    ).toBeNull()
  })

  it("maps magic document to /magics route", () => {
    const item = toSearchItem({
      _id: "magic-1",
      _type: "magic",
      slug: { current: "arcane-bolt" },
      name: "Arcane Bolt",
      school: "Arcane",
    })

    expect(item).toEqual({
      _id: "magic-1",
      type: "magic",
      typeLabel: "魔法",
      href: "/magics/arcane-bolt",
      title: "Arcane Bolt",
      description: "Arcane",
      image: placeholders.magic,
    })
  })

  it("uses kind labels for country and magic descriptions", () => {
    const organization = toSearchItem({
      _id: "country-1",
      _type: "country",
      slug: { current: "order-of-dawn" },
      name: "Order of Dawn",
      kind: "organization",
    })

    const principle = toSearchItem({
      _id: "magic-2",
      _type: "magic",
      slug: { current: "arcane-theory" },
      name: "Arcane Theory",
      kind: "principle",
    })

    expect(organization?.description).toBe("组织")
    expect(principle?.description).toBe("原理")
  })

  it("combines spell kind and element in magic description", () => {
    const spell = toSearchItem({
      _id: "magic-3",
      _type: "magic",
      slug: { current: "ember-gate" },
      name: "Ember Gate",
      kind: "spell",
      element: "fire",
    })

    expect(spell?.description).toBe("法术 · 火")
  })
})
