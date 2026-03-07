import 'server-only'

import { client } from '@/lib/sanity/client'
import { globalSearchQuery } from '@/lib/sanity/queries'

type RawSearchResult = {
  _id: string
  _type: string
  slug?: { current?: string } | string
  name?: string
  title?: string
}

export async function searchWriterReferences(term: string, limit = 8) {
  const normalizedTerm = term.trim()
  if (!normalizedTerm) return []

  try {
    const items = await client.fetch<RawSearchResult[]>(globalSearchQuery, {
      term: `${normalizedTerm}*`,
      limit,
    })

    return items.map((item) => ({
      refId: item._id,
      type: item._type,
      label: item.name ?? item.title ?? item._id,
      slug:
        typeof item.slug === 'string'
          ? item.slug
          : item.slug?.current,
    }))
  } catch {
    return []
  }
}
