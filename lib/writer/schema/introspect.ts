import 'server-only'

import { schemaTypes } from '@/sanity/schemas'
import type {
  WriterDocumentType,
  WriterFieldDefinition,
  WriterFieldKind,
  WriterSchemaSummary,
} from '@/types/writer'
import { WRITER_DOCUMENT_TYPES } from '@/lib/writer/constants'
import { getDocumentConfig } from '@/lib/writer/schema/document-config'

type SanityFieldLike = {
  name?: string
  title?: string
  type?: string
  description?: string
  validation?: unknown
  initialValue?: unknown
  options?: {
    list?: Array<{ title?: string; value?: string }>
  }
  of?: Array<{ type?: string; to?: Array<{ type?: string }> }>
  to?: Array<{ type?: string }>
}

type SanityDocumentLike = {
  name?: string
  title?: string
  fields?: SanityFieldLike[]
}

function mapFieldKind(field: SanityFieldLike): WriterFieldKind {
  switch (field.type) {
    case 'string':
      return 'string'
    case 'text':
      return 'text'
    case 'slug':
      return 'slug'
    case 'image':
      return 'image'
    case 'reference':
      return 'reference'
    case 'array': {
      const firstType = field.of?.[0]?.type
      if (firstType === 'string') return 'stringArray'
      if (firstType === 'reference') return 'referenceArray'
      if (firstType === 'block') return 'portableText'
      return 'unknown'
    }
    default:
      return 'unknown'
  }
}

function normalizeDefaultValue(value: unknown) {
  if (value === undefined || typeof value === 'function') return undefined

  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return undefined
  }
}

function mapFieldDefinition(field: SanityFieldLike): WriterFieldDefinition | null {
  if (!field.name || !field.title) return null

  const kind = mapFieldKind(field)
  const options = field.options?.list
    ?.map((option) => ({
      title: option.title ?? option.value ?? '',
      value: option.value ?? option.title ?? '',
    }))
    .filter((option) => option.title && option.value)

  const referenceTypes = field.to?.map((item) => item.type).filter(Boolean) as string[] | undefined
  const arrayReferenceTypes = field.of?.[0]?.to
    ?.map((item) => item.type)
    .filter(Boolean) as string[] | undefined

  return {
    name: field.name,
    title: field.title,
    kind,
    required: Boolean(field.validation),
    description: field.description,
    options,
    referenceTypes: referenceTypes ?? arrayReferenceTypes,
    defaultValue: normalizeDefaultValue(field.initialValue),
  }
}

function getSanityDocument(documentType: WriterDocumentType): SanityDocumentLike {
  const schema = schemaTypes.find((item) => (item as SanityDocumentLike).name === documentType)
  if (!schema) {
    throw new Error(`Unknown writer schema: ${documentType}`)
  }
  return schema as SanityDocumentLike
}

export function getWriterSchemaSummary(documentType: WriterDocumentType): WriterSchemaSummary {
  const sanityDocument = getSanityDocument(documentType)
  const config = getDocumentConfig(documentType)
  const fields = (sanityDocument.fields ?? [])
    .map(mapFieldDefinition)
    .filter((field): field is WriterFieldDefinition => Boolean(field))

  const configuredFieldNames = new Set(config.groups.flatMap((group) => group.fieldNames))
  const ungroupedFieldNames = fields
    .map((field) => field.name)
    .filter((fieldName) => !configuredFieldNames.has(fieldName))

  const groups = [...config.groups]
  if (ungroupedFieldNames.length > 0) {
    groups.push({
      id: 'other',
      title: '其他字段',
      fieldNames: ungroupedFieldNames,
    })
  }

  return {
    documentType,
    title: sanityDocument.title ?? documentType,
    titleField: config.titleField,
    slugField: config.slugField,
    bodyField: config.bodyField,
    fields,
    groups,
  }
}

export function listWriterSchemas() {
  return WRITER_DOCUMENT_TYPES.map(getWriterSchemaSummary)
}

export function getWriterFieldDefinition(documentType: WriterDocumentType, fieldName: string) {
  return getWriterSchemaSummary(documentType).fields.find((field) => field.name === fieldName)
}

export function getWriterDefaultFieldValues(documentType: WriterDocumentType) {
  const schema = getWriterSchemaSummary(documentType)

  return schema.fields.reduce<Record<string, unknown>>((defaults, field) => {
    if (field.defaultValue === undefined) return defaults
    defaults[field.name] = normalizeDefaultValue(field.defaultValue)
    return defaults
  }, {})
}
