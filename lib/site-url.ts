const LOCALHOST_URL = 'http://localhost:3000'

function normalizeBaseUrl(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

function toUrlOrNull(raw: string) {
  try {
    return new URL(raw)
  } catch {
    return null
  }
}

export function getSiteUrl() {
  const siteUrlFromEnv = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL ?? '')
  if (siteUrlFromEnv) {
    const parsed = toUrlOrNull(siteUrlFromEnv)
    if (parsed) return parsed
  }

  const vercelUrl = normalizeBaseUrl(process.env.VERCEL_URL ?? '')
  if (vercelUrl) {
    const parsed = toUrlOrNull(`https://${vercelUrl}`)
    if (parsed) return parsed
  }

  return new URL(LOCALHOST_URL)
}

export function getSiteUrlString() {
  return getSiteUrl().toString().replace(/\/$/, '')
}
