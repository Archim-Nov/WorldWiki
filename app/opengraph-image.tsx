import { ImageResponse } from 'next/og'
import { createOgCard } from '@/lib/og-card'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'WorldWiki Open Graph Image'
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    createOgCard({
      title: 'WorldWiki',
      subtitle: 'An explorable museum-style universe of stories, heroes, and regions.',
    }),
    size
  )
}
