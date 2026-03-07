'use client'

import { useEffect, useMemo, useState } from 'react'
import type { WriterReferenceValue } from '@/types/writer'
import { cn } from '@/lib/utils'

type SearchItem = {
  refId: string
  type: string
  label: string
  slug?: string
}

type ReferenceFieldPickerProps = {
  multiple?: boolean
  value: unknown
  onChange: (value: WriterReferenceValue | WriterReferenceValue[] | null) => void
}

function normalizeReferences(value: unknown): WriterReferenceValue[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is WriterReferenceValue => Boolean(item && typeof item === 'object' && '_ref' in item))
  }

  if (value && typeof value === 'object' && '_ref' in value) {
    return [value as WriterReferenceValue]
  }

  return []
}

export function ReferenceFieldPicker({ multiple, value, onChange }: ReferenceFieldPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const selectedReferences = useMemo(() => normalizeReferences(value), [value])
  const visibleResults = query.trim() ? results : []

  useEffect(() => {
    let isMounted = true
    if (!query.trim()) {
      return
    }

    fetch(`/api/writer/references?term=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        if (isMounted) {
          setResults(Array.isArray(data) ? data : [])
        }
      })

    return () => {
      isMounted = false
    }
  }, [query])

  function selectItem(item: SearchItem) {
    const nextValue: WriterReferenceValue = {
      _type: 'reference',
      _ref: item.refId,
      label: item.label,
      targetType: item.type,
    }

    if (multiple) {
      const nextList = [...selectedReferences.filter((entry) => entry._ref !== item.refId), nextValue]
      onChange(nextList)
      return
    }

    onChange(nextValue)
    setQuery('')
  }

  function removeItem(refId: string) {
    if (multiple) {
      onChange(selectedReferences.filter((item) => item._ref !== refId))
      return
    }

    onChange(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selectedReferences.map((item) => (
          <span
            key={item._ref}
            className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs"
          >
            <span>{item.label ?? item._ref}</span>
            <button type="button" onClick={() => removeItem(item._ref)} className="text-muted-foreground">
              ×
            </button>
          </span>
        ))}
      </div>

      {(multiple || selectedReferences.length === 0) && (
        <div className="space-y-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="搜索现有条目进行关联"
          />

          <div className="space-y-2 rounded-lg border border-border bg-background p-2">
            {visibleResults.length === 0 ? (
              <div className="px-2 py-1 text-xs text-muted-foreground">输入关键词后显示候选条目。</div>
            ) : (
              visibleResults.map((item) => (
                <button
                  key={item.refId}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={cn(
                    'block w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-muted',
                    selectedReferences.some((entry) => entry._ref === item.refId) && 'opacity-60'
                  )}
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.type}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
