import { ImageResponse } from 'next/og'
import { atlasName, worldName } from '@/lib/brand'
import { createOgCard } from '@/lib/og-card'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'Austrum Open Graph Image'
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    createOgCard({
      title: worldName,
      subtitle: `${atlasName} — Explore the countries, regions, creatures, champions, stories, and magic of Austrum.`,
      brandLabel: worldName,
      brandSignature: 'austrum',
    }),
    size
  )
}
