import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
  checkRateLimit,
  getObject,
  isValidEmail,
  normalizeString,
} from '@/lib/api/security'

const CONTACT_RATE_LIMIT = {
  namespace: 'contact',
  limit: 5,
  windowMs: 60_000,
}

const CONTACT_NAME_MIN_LENGTH = 2
const CONTACT_NAME_MAX_LENGTH = 80
const CONTACT_MESSAGE_MIN_LENGTH = 5
const CONTACT_MESSAGE_MAX_LENGTH = 5_000

type ContactEmailConfig = {
  apiKey: string
  from: string
  to: string
}

function getContactEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.CONTACT_FROM_EMAIL?.trim()
  const to = process.env.CONTACT_TO_EMAIL?.trim()
  if (!apiKey || !from || !to) {
    return null
  }
  return { apiKey, from, to } satisfies ContactEmailConfig
}

function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: '请求过于频繁，请稍后再试' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  )
}

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit({
    request,
    ...CONTACT_RATE_LIMIT,
  })
  if (!rateLimit.allowed) {
    return tooManyRequests(rateLimit.retryAfterSeconds)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求体格式无效' }, { status: 400 })
  }

  const payload = getObject(body)
  if (!payload) {
    return NextResponse.json({ error: '请求体格式无效' }, { status: 400 })
  }

  const honeypot = normalizeString(payload.website)
  if (honeypot) {
    return NextResponse.json({ success: true })
  }

  const name = normalizeString(payload.name)
  const email = normalizeString(payload.email).toLowerCase()
  const message = normalizeString(payload.message)

  if (!name || !email || !message) {
    return NextResponse.json({ error: '请填写所有字段' }, { status: 400 })
  }

  if (name.length < CONTACT_NAME_MIN_LENGTH || name.length > CONTACT_NAME_MAX_LENGTH) {
    return NextResponse.json({ error: '姓名长度不合法' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: '邮箱格式无效' }, { status: 400 })
  }

  if (
    message.length < CONTACT_MESSAGE_MIN_LENGTH ||
    message.length > CONTACT_MESSAGE_MAX_LENGTH
  ) {
    return NextResponse.json({ error: '消息长度不合法' }, { status: 400 })
  }

  try {
    const emailConfig = getContactEmailConfig()

    if (!emailConfig) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Contact email config missing', {
          missing: ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_TO_EMAIL']
            .filter((envKey) => !process.env[envKey]),
        })
        return NextResponse.json(
          { error: '服务暂时不可用，请稍后重试' },
          { status: 503 }
        )
      }
      return NextResponse.json({ success: true })
    }

    const resend = new Resend(emailConfig.apiKey)
    const result = await resend.emails.send({
      from: emailConfig.from,
      to: [emailConfig.to],
      replyTo: email,
      subject: `WorldWiki 联系表单 - ${name}`,
      text: `姓名: ${name}\n邮箱: ${email}\n消息:\n${message}`,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact submit failed', {
      error: error instanceof Error ? error.message : 'unknown',
    })

    return NextResponse.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}
