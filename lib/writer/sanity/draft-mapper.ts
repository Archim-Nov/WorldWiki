import 'server-only'

import type { WriterDocumentType, WriterReferenceValue } from '@/types/writer'
import { getWriterSchemaSummary } from '@/lib/writer/schema/introspect'
import { plainTextToPortableText } from '@/lib/writer/sanity/portable-text'
import { isNonEmptyString, slugifyText, toArray } from '@/lib/writer/utils'

function toReference(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return { _type: 'reference' as const, _ref: value.trim() }
  }

  if (value && typeof value === 'object' && '_ref' in value) {
    const ref = (value as WriterReferenceValue)._ref?.trim()
    if (ref) {
      return { _type: 'reference' as const, _ref: ref }
    }
  }

  return undefined
}

function mapFieldValue(kind: string, value: unknown) {
  switch (kind) {
    case 'slug': {
      const slug = isNonEmptyString(value) ? value : ''
      return slug ? { current: slugifyText(slug) } : undefined
    }
    case 'stringArray': {
      if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean)
      }

      if (typeof value === 'string') {
        return value
          .split(/\n|,/g)
          .map((item) => item.trim())
          .filter(Boolean)
      }

      return []
    }
    case 'reference':
      return toReference(value)
    case 'referenceArray':
      return toArray(value).map(toReference).filter(Boolean)
    case 'portableText':
      return plainTextToPortableText(value)
    case 'image': {
      if (!isNonEmptyString(value)) return undefined
      return {
        _type: 'image' as const,
        asset: {
          _type: 'reference' as const,
          _ref: value.trim(),
        },
      }
    }
    case 'text':
    case 'string':
    default:
      return typeof value === 'string' ? value.trim() : value
  }
}

export function mapDraftToSanityDocument(documentType: WriterDocumentType, fields: Record<string, unknown>) {
  const schema = getWriterSchemaSummary(documentType)
  const nextDocument: Record<string, unknown> = {
    _type: documentType,
  }

  for (const field of schema.fields) {
    const rawValue = fields[field.name]
    const mappedValue = mapFieldValue(field.kind, rawValue)

    if (mappedValue === undefined) continue
    if (Array.isArray(mappedValue) && mappedValue.length === 0) continue
    if (typeof mappedValue === 'string' && mappedValue.length === 0) continue

    nextDocument[field.name] = mappedValue
  }

  return nextDocument
}
