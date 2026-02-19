type RateLimitBucket = {
  count: number
  resetAt: number
}

type RateLimitDecision = {
  allowed: boolean
  retryAfterSeconds: number
}

type RateLimitOptions = {
  request: Request
  namespace: string
  limit: number
  windowMs: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanupExpiredBuckets(now: number) {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key)
    }
  }
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) {
    return null
  }
  return { url, token }
}

function readPipelineResult(
  pipelineItem: unknown,
  fallback: number
) {
  if (
    pipelineItem &&
    typeof pipelineItem === 'object' &&
    'result' in pipelineItem
  ) {
    const resultValue = (pipelineItem as { result: unknown }).result
    if (typeof resultValue === 'number') return resultValue
    if (typeof resultValue === 'string') {
      const numericResult = Number(resultValue)
      if (Number.isFinite(numericResult)) return numericResult
    }
  }
  return fallback
}

async function checkRateLimitWithUpstash({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): Promise<RateLimitDecision | null> {
  const config = getUpstashConfig()
  if (!config) {
    return null
  }

  try {
    const response = await fetch(`${config.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['PEXPIRE', key, windowMs, 'NX'],
        ['PTTL', key],
      ]),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`upstash_http_${response.status}`)
    }

    const json = (await response.json()) as unknown
    if (
      !json ||
      typeof json !== 'object' ||
      !('result' in json) ||
      !Array.isArray((json as { result: unknown }).result)
    ) {
      throw new Error('upstash_invalid_response')
    }

    const result = (json as { result: unknown[] }).result
    const count = readPipelineResult(result[0], 0)
    const pttl = readPipelineResult(result[2], windowMs)
    const retryAfterSeconds = Math.max(1, Math.ceil(Math.max(1, pttl) / 1000))

    if (count > limit) {
      return {
        allowed: false,
        retryAfterSeconds,
      }
    }

    return { allowed: true, retryAfterSeconds: 0 }
  } catch {
    return null
  }
}

function checkRateLimitInMemory({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): RateLimitDecision {
  const now = Date.now()
  cleanupExpiredBuckets(now)

  const currentBucket = rateLimitBuckets.get(key)

  if (!currentBucket || currentBucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (currentBucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((currentBucket.resetAt - now) / 1000)
      ),
    }
  }

  currentBucket.count += 1
  rateLimitBuckets.set(key, currentBucket)
  return { allowed: true, retryAfterSeconds: 0 }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(',')
    const ip = firstIp?.trim()
    if (ip) return ip
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  const cfConnectingIp = request.headers.get('cf-connecting-ip')?.trim()
  if (cfConnectingIp) return cfConnectingIp

  return 'unknown'
}

export async function checkRateLimit({
  request,
  namespace,
  limit,
  windowMs,
}: RateLimitOptions) {
  const ip = getClientIp(request)
  const key = `${namespace}:${ip}`

  const distributedDecision = await checkRateLimitWithUpstash({
    key,
    limit,
    windowMs,
  })
  if (distributedDecision) {
    return distributedDecision
  }

  return checkRateLimitInMemory({
    key,
    limit,
    windowMs,
  })
}

export function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function getObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  return value as Record<string, unknown>
}

export function isValidEmail(email: string) {
  return email.length <= 254 && EMAIL_REGEX.test(email)
}
