import { describe, expect, it, vi } from 'vitest'

const { getSiteUrlStringMock } = vi.hoisted(() => ({
  getSiteUrlStringMock: vi.fn(),
}))

vi.mock('@/lib/site-url', () => ({
  getSiteUrlString: getSiteUrlStringMock,
}))

import robots from './robots'

describe('robots', () => {
  it('returns crawler rules and sitemap url', () => {
    getSiteUrlStringMock.mockReturnValue('https://worldwiki.example')

    expect(robots()).toEqual({
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/', '/studio', '/dashboard', '/login', '/register'],
        },
      ],
      sitemap: 'https://worldwiki.example/sitemap.xml',
      host: 'https://worldwiki.example',
    })
  })
})
