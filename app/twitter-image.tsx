import { ImageResponse } from 'next/og'
import { createOgCard } from '@/lib/og-card'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'WorldWiki Twitter Image'
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    createOgCard({
      title: 'WorldWiki',
      subtitle: 'Explore connected lore with curated visual galleries and rich world details.',
    }),
    size
  )
}
