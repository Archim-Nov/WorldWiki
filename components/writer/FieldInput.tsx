'use client'

import type { WriterFieldDefinition } from '@/types/writer'
import { PortableTextFieldEditor } from '@/components/writer/PortableTextFieldEditor'
import { ReferenceFieldPicker } from '@/components/writer/ReferenceFieldPicker'

type FieldInputProps = {
  field: WriterFieldDefinition
  value: unknown
  onChange: (value: unknown) => void
}

export function FieldInput({ field, value, onChange }: FieldInputProps) {
  if (field.kind === 'reference') {
    return <ReferenceFieldPicker value={value} onChange={onChange} />
  }

  if (field.kind === 'referenceArray') {
    return <ReferenceFieldPicker multiple value={value} onChange={onChange} />
  }

  if (field.kind === 'text' || field.kind === 'portableText') {
    if (field.kind === 'portableText') {
      return (
        <PortableTextFieldEditor
          field={field}
          value={typeof value === 'string' ? value : ''}
          onChange={(nextValue) => onChange(nextValue)}
        />
      )
    }

    return (
      <textarea
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-32 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
      />
    )
  }

  if (field.kind === 'stringArray') {
    const textValue = Array.isArray(value) ? value.join('\n') : typeof value === 'string' ? value : ''
    return (
      <textarea
        value={textValue}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(/\n|,/g)
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
        className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
        placeholder="每行一个值，或使用逗号分隔"
      />
    )
  }

  if (field.options && field.options.length > 0) {
    return (
      <select
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">请选择</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      placeholder={field.kind === 'image' ? '输入 Sanity 资源引用 ID（可选）' : ''}
    />
  )
}
