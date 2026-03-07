'use client'

import { useMemo } from 'react'
import type { WriterFieldDefinition } from '@/types/writer'

type PortableTextFieldEditorProps = {
  field: WriterFieldDefinition
  value: string
  onChange: (value: string) => void
}

function normalizeParagraphs(value: string) {
  return value
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join('\n\n')
}

function getRecommendedHint(fieldName: string) {
  switch (fieldName) {
    case 'summary':
      return '建议 50–120 字，适合概述条目核心信息。'
    case 'bio':
      return '建议 200–600 字，分成 2–4 段更易读。'
    case 'content':
      return '建议 1000 字以上，可拆成多个自然段。'
    case 'details':
      return '建议分段说明规则、来源、风险与效果。'
    default:
      return '建议按自然段撰写，便于后续转换为 Portable Text。'
  }
}

export function PortableTextFieldEditor({ field, value, onChange }: PortableTextFieldEditorProps) {
  const normalizedValue = typeof value === 'string' ? value : ''
  const paragraphs = useMemo(
    () => normalizedValue.split(/\n\s*\n/g).map((paragraph) => paragraph.trim()).filter(Boolean),
    [normalizedValue]
  )

  const charCount = normalizedValue.trim().length
  const paragraphCount = paragraphs.length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{charCount} 字</span>
        <span>·</span>
        <span>{paragraphCount} 段</span>
        <span>·</span>
        <span>{getRecommendedHint(field.name)}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(normalizeParagraphs(normalizedValue))}
          className="rounded-lg border border-border px-3 py-1 text-xs"
        >
          整理段落
        </button>
        <button
          type="button"
          onClick={() => onChange(`${normalizedValue}${normalizedValue.trim() ? '\n\n' : ''}`)}
          className="rounded-lg border border-border px-3 py-1 text-xs"
        >
          插入分段
        </button>
        <button
          type="button"
          onClick={() => onChange(`${normalizedValue}${normalizedValue.trim() ? '\n\n' : ''}【小节标题】\n`)}
          className="rounded-lg border border-border px-3 py-1 text-xs"
        >
          插入小节模板
        </button>
      </div>

      <textarea
        value={normalizedValue}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-56 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm leading-7"
        placeholder="按自然段撰写正文。Writer 会在提交时自动转换为 Portable Text。"
      />

      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <div className="mb-3 text-sm font-medium">段落预览</div>
        {paragraphs.length === 0 ? (
          <div className="text-sm text-muted-foreground">还没有正文段落。</div>
        ) : (
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <div key={`${field.name}-${index}`} className="rounded-lg border border-border bg-card px-3 py-3 text-sm leading-7">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  段落 {index + 1}
                </div>
                <p className="whitespace-pre-wrap">{paragraph}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
