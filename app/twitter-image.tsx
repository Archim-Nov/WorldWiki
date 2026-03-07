import { ImageResponse } from 'next/og'
import { atlasName, worldName } from '@/lib/brand'
import { createOgCard } from '@/lib/og-card'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'Austrum Twitter Image'
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    createOgCard({
      title: worldName,
      subtitle: `${atlasName} — A curated worldbuilding atlas for lore, regions, heroes, creatures, stories, and magic.`,
      brandLabel: worldName,
      brandSignature: 'austrum',
    }),
    size
  )
}
