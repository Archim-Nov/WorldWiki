import { beforeEach, describe, expect, it, vi } from "vitest"

const { revalidatePathMock } = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}))

import { POST } from "./route"

function createJsonRequest(body: unknown) {
  return new Request("http://localhost/api/webhooks/sanity", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/webhooks/sanity", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("revalidates list page, detail page, and home when type and slug exist", async () => {
    const response = await POST(
      createJsonRequest({
        _type: "country",
        slug: { current: "avalon" },
      }) as any
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ revalidated: true })
    expect(revalidatePathMock).toHaveBeenCalledTimes(3)
    expect(revalidatePathMock).toHaveBeenCalledWith("/countries")
    expect(revalidatePathMock).toHaveBeenCalledWith("/countries/avalon")
    expect(revalidatePathMock).toHaveBeenCalledWith("/")
  })

  it("revalidates list page and home when slug is missing", async () => {
    const response = await POST(
      createJsonRequest({
        _type: "region",
      }) as any
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ revalidated: true })
    expect(revalidatePathMock).toHaveBeenCalledTimes(2)
    expect(revalidatePathMock).toHaveBeenCalledWith("/regions")
    expect(revalidatePathMock).toHaveBeenCalledWith("/")
  })

  it("revalidates magic list/detail routes", async () => {
    const response = await POST(
      createJsonRequest({
        _type: "magic",
        slug: { current: "arcane-bolt" },
      }) as any
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ revalidated: true })
    expect(revalidatePathMock).toHaveBeenCalledWith("/magics")
    expect(revalidatePathMock).toHaveBeenCalledWith("/magics/arcane-bolt")
    expect(revalidatePathMock).toHaveBeenCalledWith("/")
  })

  it("returns success without revalidation for unsupported type", async () => {
    const response = await POST(
      createJsonRequest({
        _type: "unknown",
        slug: { current: "x" },
      }) as any
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ revalidated: true })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it("returns 500 when request json parsing fails", async () => {
    const response = await POST(
      {
        json: async () => {
          throw new Error("invalid")
        },
      } as any
    )
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({ error: "Revalidation failed" })
  })
})
