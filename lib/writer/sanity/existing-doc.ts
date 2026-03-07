import 'server-only'

import { groq } from 'next-sanity'
import type { WriterDraft, WriterDocumentType } from '@/types/writer'
import { client } from '@/lib/sanity/client'
import { getWriterSchemaSummary } from '@/lib/writer/schema/introspect'
import { portableTextToPlainText } from '@/lib/writer/sanity/portable-text'
import { createTimestamp } from '@/lib/writer/utils'

const existingDocumentQuery = groq`
  *[
    _type == $documentType && (
      _id == $lookup
      || _id == $draftLookup
      || slug.current == $lookup
    )
  ][0] {
    ...
  }
`

function normalizeFieldValue(kind: string, value: unknown) {
  if (value === undefined || value === null) return undefined

  switch (kind) {
    case 'slug':
      return typeof value === 'object' && value && 'current' in value
        ? (value as { current?: string }).current ?? ''
        : typeof value === 'string'
          ? value
          : ''
    case 'portableText':
      return portableTextToPlainText(value)
    case 'reference':
      if (typeof value === 'object' && value && '_ref' in value) {
        return {
          _type: 'reference' as const,
          _ref: (value as { _ref: string })._ref,
        }
      }
      return undefined
    case 'referenceArray':
      return Array.isArray(value)
        ? value
            .filter((item) => item && typeof item === 'object' && '_ref' in item)
            .map((item) => ({
              _type: 'reference' as const,
              _ref: (item as { _ref: string })._ref,
            }))
        : []
    case 'stringArray':
      return Array.isArray(value) ? value.map((item) => String(item)) : []
    default:
      return value
  }
}

export async function loadExistingWriterDraft(documentType: WriterDocumentType, lookup: string): Promise<{
  title: string
  draft: WriterDraft
} | null> {
  const normalizedLookup = lookup.trim()
  if (!normalizedLookup) return null

  const rawDocument = await client.fetch<Record<string, unknown> | null>(existingDocumentQuery, {
    documentType,
    lookup: normalizedLookup,
    draftLookup: normalizedLookup.startsWith('drafts.') ? normalizedLookup : `drafts.${normalizedLookup}`,
  })

  if (!rawDocument) return null

  const schema = getWriterSchemaSummary(documentType)
  const fields: Record<string, unknown> = {}

  for (const field of schema.fields) {
    const rawValue = rawDocument[field.name]
    const normalizedValue = normalizeFieldValue(field.kind, rawValue)
    if (normalizedValue !== undefined) {
      fields[field.name] = normalizedValue
    }
  }

  const rawId = typeof rawDocument._id === 'string' ? rawDocument._id : ''
  const documentId = rawId.startsWith('drafts.') ? rawId.slice('drafts.'.length) : rawId
  const titleValue = String(rawDocument[schema.titleField] ?? rawDocument.name ?? rawDocument.title ?? documentId)
  fields.__documentId = documentId

  return {
    title: titleValue,
    draft: {
      documentType,
      sourceText:
        typeof fields[schema.bodyField ?? ''] === 'string'
          ? String(fields[schema.bodyField ?? ''])
          : '',
      fields,
      lockedFields: [],
      updatedAt: createTimestamp(),
    },
  }
}
