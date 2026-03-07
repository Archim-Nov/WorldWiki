import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { getWriterDefaultFieldValues, getWriterSchemaSummary, listWriterSchemas } from '@/lib/writer/schema/introspect'

describe('writer schema introspection', () => {
  it('lists all supported writer schemas', () => {
    const schemas = listWriterSchemas()
    expect(schemas).toHaveLength(6)
  })

  it('maps hero schema body and title fields', () => {
    const schema = getWriterSchemaSummary('hero')
    expect(schema.titleField).toBe('name')
    expect(schema.slugField).toBe('slug')
    expect(schema.bodyField).toBe('bio')
    expect(schema.fields.some((field) => field.name === 'bio')).toBe(true)
  })

  it('extracts default field values from sanity initialValue', () => {
    const magicSchema = getWriterSchemaSummary('magic')
    expect(magicSchema.fields.find((field) => field.name === 'kind')?.defaultValue).toBe('spell')

    const countryDefaults = getWriterDefaultFieldValues('country')
    const magicDefaults = getWriterDefaultFieldValues('magic')

    expect(countryDefaults.kind).toBe('nation')
    expect(magicDefaults.kind).toBe('spell')
  })
})
