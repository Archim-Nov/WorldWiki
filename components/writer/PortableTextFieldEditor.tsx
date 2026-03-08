'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
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

export function PortableTextFieldEditor({ field, value, onChange }: PortableTextFieldEditorProps) {
  const t = useTranslations('Writer.PortableText')
  const normalizedValue = typeof value === 'string' ? value : ''
  const paragraphs = useMemo(
    () => normalizedValue.split(/\n\s*\n/g).map((paragraph) => paragraph.trim()).filter(Boolean),
    [normalizedValue]
  )

  function getRecommendedHint(fieldName: string) {
    switch (fieldName) {
      case 'summary':
        return t('hints.summary')
      case 'bio':
        return t('hints.bio')
      case 'content':
        return t('hints.content')
      case 'details':
        return t('hints.details')
      default:
        return t('hints.default')
    }
  }

  const charCount = normalizedValue.trim().length
  const paragraphCount = paragraphs.length

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
        <span>{t('charCount', { count: charCount })}</span>
        <span>·</span>
        <span>{t('paragraphCount', { count: paragraphCount })}</span>
        <span>·</span>
        <span>{getRecommendedHint(field.name)}</span>
      </div>

      <div className='flex flex-wrap gap-2'>
        <button type='button' onClick={() => onChange(normalizeParagraphs(normalizedValue))} className='rounded-lg border border-border px-3 py-1 text-xs'>
          {t('normalize')}
        </button>
        <button
          type='button'
          onClick={() => onChange(`${normalizedValue}${normalizedValue.trim() ? '\n\n' : ''}`)}
          className='rounded-lg border border-border px-3 py-1 text-xs'
        >
          {t('insertParagraph')}
        </button>
        <button
          type='button'
          onClick={() => onChange(`${normalizedValue}${normalizedValue.trim() ? '\n\n' : ''}${t('sectionTemplateValue')}\n`)}
          className='rounded-lg border border-border px-3 py-1 text-xs'
        >
          {t('insertSectionTemplate')}
        </button>
      </div>

      <textarea
        value={normalizedValue}
        onChange={(event) => onChange(event.target.value)}
        className='min-h-56 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm leading-7'
        placeholder={t('placeholder')}
      />

      <div className='rounded-xl border border-border bg-muted/20 p-4'>
        <div className='mb-3 text-sm font-medium'>{t('previewTitle')}</div>
        {paragraphs.length === 0 ? (
          <div className='text-sm text-muted-foreground'>{t('previewEmpty')}</div>
        ) : (
          <div className='space-y-3'>
            {paragraphs.map((paragraph, index) => (
              <div key={`${field.name}-${index}`} className='rounded-lg border border-border bg-card px-3 py-3 text-sm leading-7'>
                <div className='mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground'>{t('previewParagraph', { index: index + 1 })}</div>
                <p className='whitespace-pre-wrap'>{paragraph}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
