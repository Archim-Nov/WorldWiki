import type { WriterSchemaSummary } from '@/types/writer'

export function hasMeaningfulWriterValue(value: unknown) {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return true
  return false
}

export function getWriterDraftFieldProgress(schema: Pick<WriterSchemaSummary, 'fields'>, fields: Record<string, unknown>) {
  let filledFieldCount = 0
  const missingRequiredFields = [] as WriterSchemaSummary['fields']

  for (const field of schema.fields) {
    const hasValue = hasMeaningfulWriterValue(fields[field.name])

    if (hasValue) {
      filledFieldCount += 1
    }

    if (field.required && !hasValue) {
      missingRequiredFields.push(field)
    }
  }

  return {
    filledFieldCount,
    missingRequiredFields,
  }
}
