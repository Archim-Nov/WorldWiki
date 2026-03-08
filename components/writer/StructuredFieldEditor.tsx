'use client'

import { useTranslations } from 'next-intl'
import type { WriterSchemaSummary } from '@/types/writer'
import { FieldInput } from '@/components/writer/FieldInput'

type StructuredFieldEditorProps = {
  schema: WriterSchemaSummary
  fields: Record<string, unknown>
  lockedFields: string[]
  onFieldChange: (fieldName: string, value: unknown) => void
  onToggleLock: (fieldName: string) => void
}

export function StructuredFieldEditor({
  schema,
  fields,
  lockedFields,
  onFieldChange,
  onToggleLock,
}: StructuredFieldEditorProps) {
  const t = useTranslations('Writer.StructuredFieldEditor')
  const commonT = useTranslations('Writer.Common')
  const fieldMap = new Map(schema.fields.map((field) => [field.name, field]))

  return (
    <div className='space-y-5'>
      {schema.groups.map((group) => (
        <section key={group.id} className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <div className='mb-4 flex items-center justify-between gap-4'>
            <div>
              <h2 className='text-lg font-semibold'>{group.title}</h2>
              <p className='text-xs text-muted-foreground'>{t('groupDescription')}</p>
            </div>
          </div>

          <div className='space-y-4'>
            {group.fieldNames.map((fieldName) => {
              const field = fieldMap.get(fieldName)
              if (!field) return null

              const isLocked = lockedFields.includes(field.name)

              return (
                <div key={field.name} className='space-y-2 rounded-xl border border-border/70 p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div>
                      <label className='text-sm font-medium'>{field.title}</label>
                      <div className='mt-1 text-xs text-muted-foreground'>
                        {field.kind}
                        {field.required ? ` · ${t('requiredBadge')}` : ''}
                        {field.description ? ` · ${field.description}` : ''}
                      </div>
                    </div>
                    <button type='button' onClick={() => onToggleLock(field.name)} className='rounded-lg border border-border px-3 py-1 text-xs'>
                      {isLocked ? commonT('unlockField') : commonT('lockField')}
                    </button>
                  </div>

                  <FieldInput field={field} value={fields[field.name]} onChange={(value) => onFieldChange(field.name, value)} />
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
