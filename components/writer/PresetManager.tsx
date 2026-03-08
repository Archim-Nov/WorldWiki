'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { WriterDocumentType, WriterPromptPreset } from '@/types/writer'

type PresetFormState = {
  id?: string
  name: string
  scope: 'project' | 'documentType' | 'task'
  documentType: string
  content: string
  enabled: boolean
}

const emptyForm: PresetFormState = {
  name: '',
  scope: 'project',
  documentType: '',
  content: '',
  enabled: true,
}

function createFormFromPreset(preset: WriterPromptPreset): PresetFormState {
  return {
    id: preset.id,
    name: preset.name,
    scope: preset.scope,
    documentType: preset.documentType ?? '',
    content: preset.content,
    enabled: preset.enabled,
  }
}

const documentTypes: WriterDocumentType[] = ['country', 'region', 'creature', 'hero', 'story', 'magic']

export function PresetManager({
  initialPresets,
  usageCountById,
}: {
  initialPresets: WriterPromptPreset[]
  usageCountById: Record<string, number>
}) {
  const locale = useLocale()
  const t = useTranslations('Writer.PresetManager')
  const commonT = useTranslations('Writer.Common')
  const [presets, setPresets] = useState(initialPresets)
  const [form, setForm] = useState<PresetFormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(form.id)
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale]
  )

  async function refresh() {
    const response = await fetch('/api/writer/presets')
    const data = await response.json()
    setPresets(Array.isArray(data) ? data : [])
  }

  function resetForm() {
    setForm(emptyForm)
  }

  function handleEdit(preset: WriterPromptPreset) {
    setForm(createFormFromPreset(preset))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    try {
      await fetch('/api/writer/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          scope: form.scope,
          documentType: form.scope === 'documentType' ? form.documentType : undefined,
          content: form.content,
          enabled: form.enabled,
        }),
      })

      resetForm()
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/writer/presets?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    if (form.id === id) {
      resetForm()
    }
    await refresh()
  }

  function getUsageLabel(id: string) {
    const count = usageCountById[id] ?? 0
    return count > 0 ? commonT('usedBySessions', { count }) : commonT('unusedBySessions')
  }

  function getScopeLabel(scope: WriterPromptPreset['scope']) {
    return commonT(`presetScopes.${scope}`)
  }

  return (
    <div className='grid gap-6 lg:grid-cols-[1.2fr_1fr]'>
      <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-xl font-semibold'>{t('existingTitle')}</h2>
          <div className='text-sm text-muted-foreground'>{t('count', { count: presets.length })}</div>
        </div>

        <div className='mt-4 space-y-3'>
          {presets.length === 0 ? (
            <div className='text-sm text-muted-foreground'>{t('empty')}</div>
          ) : (
            presets.map((preset) => (
              <div key={preset.id} className='rounded-xl border border-border px-4 py-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <div className='font-medium'>{preset.name}</div>
                    <div className='mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                      <span>{getScopeLabel(preset.scope)}</span>
                      {preset.documentType ? <span>{commonT(`documentTypes.${preset.documentType}`)}</span> : null}
                      <span>{preset.enabled ? commonT('enabled') : commonT('disabled')}</span>
                      <span>{getUsageLabel(preset.id)}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <button type='button' onClick={() => handleEdit(preset)} className='text-sm text-foreground'>
                      {commonT('edit')}
                    </button>
                    <button type='button' onClick={() => handleDelete(preset.id)} className='text-sm text-destructive'>
                      {commonT('delete')}
                    </button>
                  </div>
                </div>
                <div className='mt-3 whitespace-pre-wrap text-sm text-muted-foreground'>{preset.content}</div>
                <div className='mt-2 text-xs text-muted-foreground'>
                  {commonT('lastUpdated')}：{formatter.format(new Date(preset.updatedAt))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-xl font-semibold'>{isEditing ? t('editTitle') : t('createTitle')}</h2>
          {isEditing ? (
            <button type='button' onClick={resetForm} className='text-sm text-muted-foreground'>
              {commonT('cancelEdit')}
            </button>
          ) : null}
        </div>

        <form className='mt-4 space-y-4' onSubmit={handleSubmit}>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
            placeholder={t('namePlaceholder')}
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            <select
              value={form.scope}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  scope: event.target.value === 'documentType' || event.target.value === 'task' ? event.target.value : 'project',
                  documentType: event.target.value === 'documentType' ? current.documentType : '',
                }))
              }
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
            >
              <option value='project'>{commonT('presetScopes.project')}</option>
              <option value='documentType'>{commonT('presetScopes.documentType')}</option>
              <option value='task'>{commonT('presetScopes.task')}</option>
            </select>

            <label className='flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm'>
              <input
                type='checkbox'
                checked={form.enabled}
                onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
              />
              {t('enabledLabel')}
            </label>
          </div>

          {form.scope === 'documentType' ? (
            <select
              value={form.documentType}
              onChange={(event) => setForm((current) => ({ ...current, documentType: event.target.value }))}
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
            >
              <option value=''>{t('documentTypePlaceholder')}</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {commonT(`documentTypes.${type}`)}
                </option>
              ))}
            </select>
          ) : null}

          <textarea
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            className='min-h-48 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm'
            placeholder={t('contentPlaceholder')}
          />

          <button type='submit' disabled={saving} className='rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60'>
            {saving ? t('saving') : isEditing ? t('saveChanges') : t('save')}
          </button>
        </form>
      </section>
    </div>
  )
}
