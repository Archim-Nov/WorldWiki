import 'server-only'

import { groq } from 'next-sanity'
import type { WriterDocumentType } from '@/types/writer'
import { client } from '@/lib/sanity/client'

type WriterLibraryItem = {
  _id: string
  _type: string
  _updatedAt: string
  slug?: { current?: string }
  name?: string
  title?: string
  summary?: string
}

const recentLibraryQuery = groq`
  *[_type == $documentType] | order(_updatedAt desc)[0...$limit] {
    _id,
    _type,
    _updatedAt,
    slug,
    name,
    title,
    summary
  }
`

const searchLibraryQuery = groq`
  *[
    _type == $documentType && (
      name match $term
      || title match $term
      || slug.current match $term
      || summary match $term
    )
  ] | order(_updatedAt desc)[0...$limit] {
    _id,
    _type,
    _updatedAt,
    slug,
    name,
    title,
    summary
  }
`

export async function listWriterLibraryItems(documentType: WriterDocumentType, term?: string, limit = 8) {
  const normalizedTerm = term?.trim()

  const items = normalizedTerm
    ? await client.fetch<WriterLibraryItem[]>(searchLibraryQuery, {
        documentType,
        term: `${normalizedTerm}*`,
        limit,
      })
    : await client.fetch<WriterLibraryItem[]>(recentLibraryQuery, {
        documentType,
        limit,
      })

  return items.map((item) => ({
    id: item._id,
    type: item._type,
    updatedAt: item._updatedAt,
    slug: item.slug?.current ?? '',
    title: item.name ?? item.title ?? item._id,
    summary: item.summary ?? '',
  }))
}
