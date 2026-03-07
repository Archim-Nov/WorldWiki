import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { getWriterSchemaSummary, listWriterSchemas } from '@/lib/writer/schema/introspect'

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
})
