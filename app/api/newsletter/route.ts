import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  checkRateLimit,
  getObject,
  isValidEmail,
  normalizeString,
} from '@/lib/api/security'

const NEWSLETTER_RATE_LIMIT = {
  namespace: 'newsletter',
  limit: 10,
  windowMs: 60_000,
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
    ...NEWSLETTER_RATE_LIMIT,
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

  const email = normalizeString(payload.email).toLowerCase()

  if (!email) {
    return NextResponse.json({ error: '请输入邮箱' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: '邮箱格式无效' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // 存储到 Supabase（需要先创建 subscribers 表）
    const { error } = await supabase.from('subscribers').insert({ email })

    if (!error) {
      return NextResponse.json({ success: true })
    }

    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
        ? error.code
        : null

    if (errorCode === '23505') {
      return NextResponse.json({ error: '该邮箱已订阅' }, { status: 400 })
    }

    console.error('Newsletter subscribe failed', {
      code: errorCode ?? 'unknown',
    })
    return NextResponse.json({ error: '订阅失败，请稍后重试' }, { status: 500 })
  } catch (error) {
    console.error('Newsletter subscribe failed', {
      error: error instanceof Error ? error.message : 'unknown',
    })

    return NextResponse.json({ error: '订阅失败，请稍后重试' }, { status: 500 })
  }
}
