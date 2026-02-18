import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  attachImage,
  buildSeedDocs,
  imageUrlById,
  organizations,
  principles,
  runSeed,
  spells,
} from "./seed-org-magic-content.js"

describe("seed-org-magic-content data", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("contains 5 organizations, 5 principles, 5 spells", () => {
    expect(organizations).toHaveLength(5)
    expect(principles).toHaveLength(5)
    expect(spells).toHaveLength(5)
  })

  it("uses valid types and kind values", () => {
    expect(organizations.every((doc) => doc._type === "country")).toBe(true)
    expect(organizations.every((doc) => doc.kind === "organization")).toBe(true)
    expect(principles.every((doc) => doc._type === "magic")).toBe(true)
    expect(principles.every((doc) => doc.kind === "principle")).toBe(true)
    expect(spells.every((doc) => doc._type === "magic")).toBe(true)
    expect(spells.every((doc) => doc.kind === "spell")).toBe(true)
    expect(
      spells.every((doc) =>
        ["fire", "wind", "earth", "water"].includes(doc.element ?? "")
      )
    ).toBe(true)
  })

  it("provides unique ids/slugs and a real image URL per entry", () => {
    const allDocs = [...organizations, ...principles, ...spells]
    const ids = allDocs.map((doc) => doc._id)
    const slugs = allDocs.map((doc) => doc.slug.current)

    expect(new Set(ids).size).toBe(allDocs.length)
    expect(new Set(slugs).size).toBe(allDocs.length)
    expect(Object.keys(imageUrlById)).toHaveLength(allDocs.length)

    for (const id of ids) {
      const url = imageUrlById[id as keyof typeof imageUrlById]
      expect(url).toBeTruthy()
      expect(url.startsWith("https://images.unsplash.com/photo-")).toBe(true)
      expect(url.includes("auto=format")).toBe(true)
      expect(url.endsWith(".svg")).toBe(false)
    }
  })

  it("includes structured detail blocks for principle/spell entries", () => {
    const allMagic = [...principles, ...spells]
    for (const doc of allMagic) {
      expect(Array.isArray(doc.details)).toBe(true)
      expect(doc.details.length).toBeGreaterThanOrEqual(4)
      expect(doc.details[0]?._type).toBe("block")
    }
  })

  it("attaches image field and removes imageMeta", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      })
    )

    const client = {
      assets: {
        upload: vi.fn().mockResolvedValue({ _id: "image-1" }),
      },
    }

    const doc = { ...organizations[0] }
    await attachImage(
      client as unknown as Parameters<typeof attachImage>[0],
      doc as unknown as Parameters<typeof attachImage>[1],
      "mapImage"
    )

    expect(client.assets.upload).toHaveBeenCalledTimes(1)
    expect(doc).toHaveProperty("mapImage.asset._ref", "image-1")
    expect(doc).not.toHaveProperty("imageMeta")
  })

  it("throws explicit error when image fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      })
    )

    const client = {
      assets: {
        upload: vi.fn(),
      },
    }
    const doc = { ...spells[0] }

    await expect(
      attachImage(
        client as unknown as Parameters<typeof attachImage>[0],
        doc as unknown as Parameters<typeof attachImage>[1],
        "coverImage"
      )
    ).rejects.toThrow(/Failed to fetch image/)
    expect(client.assets.upload).not.toHaveBeenCalled()
  })

  it("runs full seed orchestration with injected client", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: async () => new Uint8Array([9, 8, 7]).buffer,
      })
    )

    const client = {
      assets: {
        upload: vi.fn().mockResolvedValue({ _id: "image-seeded" }),
      },
      createOrReplace: vi.fn().mockResolvedValue(undefined),
    }

    const docs = buildSeedDocs()
    docs.organizations = docs.organizations.slice(0, 1)
    docs.principles = docs.principles.slice(0, 1)
    docs.spells = docs.spells.slice(0, 1)

    await runSeed(
      client as unknown as Parameters<typeof runSeed>[0],
      docs as unknown as Parameters<typeof runSeed>[1]
    )

    expect(client.assets.upload).toHaveBeenCalledTimes(3)
    expect(client.createOrReplace).toHaveBeenCalledTimes(3)
    expect(docs.organizations[0]).toHaveProperty("mapImage")
    expect(docs.principles[0]).toHaveProperty("coverImage")
    expect(docs.spells[0]).toHaveProperty("coverImage")
  })
})
