import { describe, expect, it, vi } from "vitest"

import { POST } from "./route"

function createJsonRequest(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/contact", () => {
  it("returns 400 when required fields are missing", async () => {
    const response = await POST(createJsonRequest({ name: "Alice", email: "" }))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toHaveProperty("error")
  })

  it("returns success for valid payload", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    const response = await POST(
      createJsonRequest({
        name: "Alice",
        email: "alice@example.com",
        message: "hello",
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ success: true })
    expect(logSpy).toHaveBeenCalledOnce()

    logSpy.mockRestore()
  })

  it("returns 500 when parsing body fails", async () => {
    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: "{",
        headers: { "content-type": "application/json" },
      })
    )
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toHaveProperty("error")
  })
})
