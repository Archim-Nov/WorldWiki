import { beforeEach, describe, expect, it, vi } from "vitest"

const { revalidatePathMock } = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}))

import { POST } from "./route"

const WEBHOOK_SECRET = "test-webhook-secret"

function createJsonRequest(body: unknown, secret = WEBHOOK_SECRET) {
  return new Request("http://localhost/api/webhooks/sanity", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      "x-sanity-webhook-secret": secret,
    },
  })
}

describe("POST /api/webhooks/sanity", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SANITY_WEBHOOK_SECRET = WEBHOOK_SECRET
  })

  it("revalidates list page, detail page, and home when type and slug exist", async () => {
    const response = await POST(
      createJsonRequest({
        _type: "country",
        slug: { current: "avalon" },
      })
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
      })
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
      })
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
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ revalidated: true })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it("returns 401 when secret header is invalid", async () => {
    const response = await POST(createJsonRequest({ _type: "country" }, "wrong-secret"))
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json).toEqual({ error: "Unauthorized" })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it("returns 500 when webhook secret is missing in server env", async () => {
    delete process.env.SANITY_WEBHOOK_SECRET
    const response = await POST(createJsonRequest({ _type: "country" }))
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({ error: "SANITY_WEBHOOK_SECRET is not configured" })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it("returns 500 when request json parsing fails", async () => {
    const response = await POST(
      new Request("http://localhost/api/webhooks/sanity", {
        method: "POST",
        body: "{",
        headers: {
          "content-type": "application/json",
          "x-sanity-webhook-secret": WEBHOOK_SECRET,
        },
      })
    )
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({ error: "Revalidation failed" })
  })
})
