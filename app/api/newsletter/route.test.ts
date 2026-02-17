import { beforeEach, describe, expect, it, vi } from "vitest"

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}))

import { POST } from "./route"

function createJsonRequest(body: unknown) {
  return new Request("http://localhost/api/newsletter", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 400 when email is missing", async () => {
    const response = await POST(createJsonRequest({}) as any)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toHaveProperty("error")
    expect(createClientMock).not.toHaveBeenCalled()
  })

  it("stores subscriber and returns success", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
    createClientMock.mockResolvedValue({ from: fromMock })

    const response = await POST(
      createJsonRequest({ email: "alice@example.com" }) as any
    )
    const json = await response.json()

    expect(createClientMock).toHaveBeenCalledOnce()
    expect(fromMock).toHaveBeenCalledWith("subscribers")
    expect(insertMock).toHaveBeenCalledWith({ email: "alice@example.com" })
    expect(response.status).toBe(200)
    expect(json).toEqual({ success: true })
  })

  it("returns 400 when subscriber already exists", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: { code: "23505" } })
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
    createClientMock.mockResolvedValue({ from: fromMock })

    const response = await POST(
      createJsonRequest({ email: "alice@example.com" }) as any
    )
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toHaveProperty("error")
  })

  it("returns 500 when supabase returns unknown error", async () => {
    const insertMock = vi
      .fn()
      .mockResolvedValue({ error: { code: "XX", message: "db error" } })
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
    createClientMock.mockResolvedValue({ from: fromMock })

    const response = await POST(
      createJsonRequest({ email: "alice@example.com" }) as any
    )
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toHaveProperty("error")
  })
})
