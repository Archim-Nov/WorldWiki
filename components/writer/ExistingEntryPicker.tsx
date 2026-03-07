'use client'

import { useEffect, useState } from 'react'
import type { WriterDocumentType, WriterSchemaSummary } from '@/types/writer'

type LibraryItem = {
  id: string
  type: string
  updatedAt: string
  slug: string
  title: string
  summary: string
}

type ExistingEntryPickerProps = {
  schemas: WriterSchemaSummary[]
  selectedType: WriterDocumentType
  onSelectType: (value: WriterDocumentType) => void
  onImport: (lookup: string, documentType: WriterDocumentType) => Promise<void>
  disabled?: boolean
}

export function ExistingEntryPicker({
  schemas,
  selectedType,
  onSelectType,
  onImport,
  disabled,
}: ExistingEntryPickerProps) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<LibraryItem[]>([])

  useEffect(() => {
    let active = true

    fetch(
      `/api/writer/library?documentType=${encodeURIComponent(selectedType)}&term=${encodeURIComponent(query)}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          setItems(Array.isArray(data) ? data : [])
        }
      })

    return () => {
      active = false
    }
  }, [query, selectedType])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">条目类型</label>
        <select
          value={selectedType}
          onChange={(event) => onSelectType(event.target.value as WriterDocumentType)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {schemas.map((schema) => (
            <option key={schema.documentType} value={schema.documentType}>
              {schema.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">搜索现有条目</label>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="按标题、slug 或摘要搜索"
        />
      </div>

      <div className="space-y-2 rounded-xl border border-border p-3">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">没有找到匹配条目。</div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onImport(item.slug || item.id, selectedType)}
              className="block w-full rounded-xl border border-border px-4 py-4 text-left transition hover:bg-muted/40 disabled:opacity-60"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {item.slug || item.id}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              </div>
              {item.summary ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
              ) : null}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
