'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { WriterProviderSummary } from '@/types/writer'

type ProviderFormState = {
  id?: string
  name: string
  kind: 'openai-compatible' | 'cli'
  enabled: boolean
  model: string
  baseUrl: string
  apiKey: string
  temperature: string
  command: string
  argsText: string
}

const emptyForm: ProviderFormState = {
  name: '',
  kind: 'openai-compatible',
  enabled: true,
  model: '',
  baseUrl: '',
  apiKey: '',
  temperature: '',
  command: '',
  argsText: '',
}

function createFormFromProvider(provider: WriterProviderSummary): ProviderFormState {
  return {
    id: provider.id,
    name: provider.name,
    kind: provider.kind,
    enabled: provider.enabled,
    model: provider.model ?? '',
    baseUrl: provider.baseUrl ?? '',
    apiKey: '',
    temperature: typeof provider.temperature === 'number' ? String(provider.temperature) : '',
    command: provider.command ?? '',
    argsText: provider.args?.join(' ') ?? '',
  }
}

export function ProviderManager({
  initialProviders,
  usageCountById,
}: {
  initialProviders: WriterProviderSummary[]
  usageCountById: Record<string, number>
}) {
  const locale = useLocale()
  const t = useTranslations('Writer.ProviderManager')
  const commonT = useTranslations('Writer.Common')
  const [providers, setProviders] = useState(initialProviders)
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [form, setForm] = useState<ProviderFormState>(emptyForm)
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
    const response = await fetch('/api/writer/providers')
    const data = await response.json()
    setProviders(Array.isArray(data) ? data : [])
  }

  function resetForm() {
    setForm(emptyForm)
  }

  function handleEdit(provider: WriterProviderSummary) {
    setForm(createFormFromProvider(provider))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    try {
      await fetch('/api/writer/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          kind: form.kind,
          enabled: form.enabled,
          model: form.model,
          baseUrl: form.baseUrl,
          apiKey: form.apiKey,
          command: form.command,
          args: form.argsText
            .split(/\s+/g)
            .map((item) => item.trim())
            .filter(Boolean),
          temperature:
            form.temperature.trim() === '' ? undefined : Number.isFinite(Number(form.temperature)) ? Number(form.temperature) : undefined,
        }),
      })

      resetForm()
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/writer/providers?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    if (form.id === id) {
      resetForm()
    }
    await refresh()
  }

  async function handleTest(id: string) {
    setMessages((current) => ({ ...current, [id]: t('testing') }))

    const response = await fetch('/api/writer/providers/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId: id }),
    })
    const data = await response.json()

    setMessages((current) => ({
      ...current,
      [id]: data.message ?? (response.ok ? t('connectionSuccess') : t('connectionFailed')),
    }))
  }

  function getKindLabel(kind: WriterProviderSummary['kind']) {
    return kind === 'cli' ? commonT('providerKinds.cli') : commonT('providerKinds.openaiCompatible')
  }

  function getUsageLabel(id: string) {
    const count = usageCountById[id] ?? 0
    return count > 0 ? commonT('usedBySessions', { count }) : commonT('unusedBySessions')
  }

  return (
    <div className='grid gap-6 lg:grid-cols-[1.2fr_1fr]'>
      <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-xl font-semibold'>{t('existingTitle')}</h2>
          <div className='text-sm text-muted-foreground'>{t('count', { count: providers.length })}</div>
        </div>

        <div className='mt-4 space-y-3'>
          {providers.length === 0 ? (
            <div className='text-sm text-muted-foreground'>{t('empty')}</div>
          ) : (
            providers.map((provider) => {
              const infoText =
                provider.kind === 'cli'
                  ? t('commandInfo', {
                      command: [provider.command ?? '-', provider.args?.join(' ') ?? ''].filter(Boolean).join(' '),
                    })
                  : t('apiInfo', {
                      model: provider.model ?? '-',
                      baseUrl: provider.baseUrl ?? t('defaultBaseUrl'),
                    })

              return (
                <div key={provider.id} className='rounded-xl border border-border px-4 py-4'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <div className='font-medium'>{provider.name}</div>
                      <div className='mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                        <span>{getKindLabel(provider.kind)}</span>
                        <span>{provider.enabled ? commonT('enabled') : commonT('disabled')}</span>
                        {provider.hasApiKey ? <span>{provider.apiKeyPreview}</span> : null}
                        <span>{getUsageLabel(provider.id)}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <button type='button' onClick={() => handleEdit(provider)} className='text-sm text-foreground'>
                        {commonT('edit')}
                      </button>
                      <button type='button' onClick={() => handleDelete(provider.id)} className='text-sm text-destructive'>
                        {commonT('delete')}
                      </button>
                    </div>
                  </div>
                  <div className='mt-3 text-sm text-muted-foreground'>{infoText}</div>
                  <div className='mt-2 text-xs text-muted-foreground'>
                    {commonT('lastUpdated')}：{formatter.format(new Date(provider.updatedAt))}
                  </div>
                  <div className='mt-3 flex items-center gap-3'>
                    <button type='button' onClick={() => handleTest(provider.id)} className='rounded-lg border border-border px-3 py-1 text-xs'>
                      {t('testConnection')}
                    </button>
                    {messages[provider.id] ? <span className='text-xs text-muted-foreground'>{messages[provider.id]}</span> : null}
                  </div>
                </div>
              )
            })
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
              value={form.kind}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  kind: event.target.value === 'cli' ? 'cli' : 'openai-compatible',
                }))
              }
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
            >
              <option value='openai-compatible'>{commonT('providerKinds.openaiCompatible')}</option>
              <option value='cli'>{commonT('providerKinds.cli')}</option>
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

          {form.kind === 'cli' ? (
            <>
              <input
                value={form.command}
                onChange={(event) => setForm((current) => ({ ...current, command: event.target.value }))}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
                placeholder={t('commandPlaceholder')}
              />
              <input
                value={form.argsText}
                onChange={(event) => setForm((current) => ({ ...current, argsText: event.target.value }))}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
                placeholder={t('argsPlaceholder')}
              />
            </>
          ) : (
            <>
              <input
                value={form.model}
                onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
                placeholder={t('modelPlaceholder')}
              />
              <input
                value={form.baseUrl}
                onChange={(event) => setForm((current) => ({ ...current, baseUrl: event.target.value }))}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
                placeholder={t('baseUrlPlaceholder')}
              />
              <input
                value={form.apiKey}
                onChange={(event) => setForm((current) => ({ ...current, apiKey: event.target.value }))}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
                placeholder={isEditing ? t('apiKeyPlaceholderEdit') : t('apiKeyPlaceholderCreate')}
              />
              <input
                value={form.temperature}
                onChange={(event) => setForm((current) => ({ ...current, temperature: event.target.value }))}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
                placeholder={t('temperaturePlaceholder')}
              />
            </>
          )}

          <button type='submit' disabled={saving} className='rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60'>
            {saving ? t('saving') : isEditing ? t('saveChanges') : t('save')}
          </button>
        </form>
      </section>
    </div>
  )
}
