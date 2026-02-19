import { afterEach, describe, expect, it } from 'vitest'
import { getSiteUrl, getSiteUrlString } from './site-url'

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
const originalVercelUrl = process.env.VERCEL_URL

function restoreEnv() {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  }

  if (originalVercelUrl === undefined) {
    delete process.env.VERCEL_URL
  } else {
    process.env.VERCEL_URL = originalVercelUrl
  }
}

describe('site-url', () => {
  afterEach(() => {
    restoreEnv()
  })

  it('uses NEXT_PUBLIC_SITE_URL when available', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://worldwiki.example/'
    process.env.VERCEL_URL = 'project.vercel.app'

    expect(getSiteUrl().toString()).toBe('https://worldwiki.example/')
    expect(getSiteUrlString()).toBe('https://worldwiki.example')
  })

  it('falls back to VERCEL_URL when NEXT_PUBLIC_SITE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    process.env.VERCEL_URL = 'project.vercel.app'

    expect(getSiteUrl().toString()).toBe('https://project.vercel.app/')
    expect(getSiteUrlString()).toBe('https://project.vercel.app')
  })

  it('falls back to localhost when no env is configured', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.VERCEL_URL

    expect(getSiteUrl().toString()).toBe('http://localhost:3000/')
    expect(getSiteUrlString()).toBe('http://localhost:3000')
  })
})
