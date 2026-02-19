import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"

const { sendEmailMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
}))

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: sendEmailMock,
    },
  })),
}))

import { POST } from "./route"

const originalNodeEnv = process.env.NODE_ENV

function createJsonRequest(body: unknown, ip: string) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
  })
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = "test"
    delete process.env.RESEND_API_KEY
    delete process.env.CONTACT_FROM_EMAIL
    delete process.env.CONTACT_TO_EMAIL
  })

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(
      createJsonRequest({ name: "Alice", email: "" }, "198.51.100.11")
    )
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toHaveProperty("error")
  })

  it("returns 400 when email format is invalid", async () => {
    const response = await POST(
      createJsonRequest({
        name: "Alice",
        email: "alice-at-example.com",
        message: "hello world",
      }, "198.51.100.12")
    )
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toHaveProperty("error")
  })

  it("returns success for valid payload", async () => {
    const response = await POST(
      createJsonRequest({
        name: "Alice",
        email: "alice@example.com",
        message: "hello world",
      }, "198.51.100.13")
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ success: true })
  })

  it("sends email via resend when contact email config exists", async () => {
    process.env.RESEND_API_KEY = "re_test_api_key"
    process.env.CONTACT_FROM_EMAIL = "WorldWiki <noreply@example.com>"
    process.env.CONTACT_TO_EMAIL = "owner@example.com"
    sendEmailMock.mockResolvedValue({ data: { id: "mail_1" }, error: null })

    const response = await POST(
      createJsonRequest(
        {
          name: "Alice",
          email: "alice@example.com",
          message: "hello world",
        },
        "198.51.100.131"
      )
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ success: true })
    expect(sendEmailMock).toHaveBeenCalledOnce()
    expect(sendEmailMock).toHaveBeenCalledWith({
      from: "WorldWiki <noreply@example.com>",
      to: ["owner@example.com"],
      replyTo: "alice@example.com",
      subject: "WorldWiki 联系表单 - Alice",
      text: "姓名: Alice\n邮箱: alice@example.com\n消息:\nhello world",
    })
  })

  it("returns 503 in production when contact email config is missing", async () => {
    process.env.NODE_ENV = "production"

    const response = await POST(
      createJsonRequest(
        {
          name: "Alice",
          email: "alice@example.com",
          message: "hello world",
        },
        "198.51.100.132"
      )
    )
    const json = await response.json()

    expect(response.status).toBe(503)
    expect(json).toHaveProperty("error")
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it("returns 400 when parsing body fails", async () => {
    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: "{",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.14",
        },
      })
    )
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toHaveProperty("error")
  })

  it("returns 429 when rate limit is exceeded", async () => {
    const ip = "198.51.100.200"
    const body = {
      name: "Alice",
      email: "alice@example.com",
      message: "hello world",
    }

    for (let index = 0; index < 5; index += 1) {
      const response = await POST(createJsonRequest(body, ip))
      expect(response.status).toBe(200)
    }

    const limitedResponse = await POST(createJsonRequest(body, ip))
    const json = await limitedResponse.json()

    expect(limitedResponse.status).toBe(429)
    expect(limitedResponse.headers.get("Retry-After")).toBeTruthy()
    expect(json).toHaveProperty("error")
  })
})
