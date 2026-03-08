export type WriterFieldPatchMode = 'chat' | 'scaffold' | 'rewrite' | 'fill-missing'

type ApplyWriterFieldPatchArgs = {
  currentFields: Record<string, unknown>
  incomingFields: Record<string, unknown>
  lockedFields: string[]
  mode: WriterFieldPatchMode
  allowedFieldNames?: string[]
}

function hasMeaningfulWriterValue(value: unknown) {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return true
  return false
}

export function applyWriterFieldPatch(args: ApplyWriterFieldPatchArgs) {
  const nextFields = { ...args.currentFields }
  const allowedFieldNames = args.allowedFieldNames ? new Set(args.allowedFieldNames) : null
  const appliedFieldNames: string[] = []
  const skippedLockedFieldNames: string[] = []
  const skippedFilledFieldNames: string[] = []

  for (const [fieldName, value] of Object.entries(args.incomingFields)) {
    if (allowedFieldNames && !allowedFieldNames.has(fieldName)) continue
    if (value === undefined) continue

    if (args.lockedFields.includes(fieldName)) {
      skippedLockedFieldNames.push(fieldName)
      continue
    }

    if (args.mode === 'fill-missing' && hasMeaningfulWriterValue(nextFields[fieldName])) {
      skippedFilledFieldNames.push(fieldName)
      continue
    }

    nextFields[fieldName] = value
    appliedFieldNames.push(fieldName)
  }

  return {
    fields: nextFields,
    appliedFieldNames,
    skippedLockedFieldNames,
    skippedFilledFieldNames,
  }
}