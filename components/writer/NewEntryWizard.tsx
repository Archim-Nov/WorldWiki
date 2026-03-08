'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { WriterDocumentType, WriterPromptPreset, WriterProviderSummary, WriterSchemaSummary, WriterTypeSuggestion } from '@/types/writer'
import { withLocalePrefix } from '@/i18n/path'
import { defaultLocale, isValidLocale } from '@/i18n/routing'
import { ExistingEntryPicker } from '@/components/writer/ExistingEntryPicker'

type NewEntryWizardProps = {
  schemas: WriterSchemaSummary[]
  providers: WriterProviderSummary[]
  presets: WriterPromptPreset[]
}

type EntryMode = 'conversation' | 'import'

function isPresetAvailableForType(preset: WriterPromptPreset, documentType: WriterDocumentType) {
  if (!preset.enabled) return false
  if (preset.scope !== 'documentType') return true
  return preset.documentType === documentType
}

function getDefaultPresetIds(presets: WriterPromptPreset[], documentType: WriterDocumentType) {
  return presets
    .filter((preset) => preset.enabled && (preset.scope === 'project' || (preset.scope === 'documentType' && preset.documentType === documentType)))
    .map((preset) => preset.id)
}

export function NewEntryWizard({ schemas, providers, presets }: NewEntryWizardProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('Writer.NewEntry')
  const commonT = useTranslations('Writer.Common')
  const activeLocale = isValidLocale(locale) ? locale : defaultLocale
  const initialDocumentType = schemas[0]?.documentType ?? 'country'

  const [entryMode, setEntryMode] = useState<EntryMode>('conversation')
  const [title, setTitle] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [documentType, setDocumentType] = useState(initialDocumentType)
  const [providerId, setProviderId] = useState(providers[0]?.id ?? '')
  const [importLookup, setImportLookup] = useState('')
  const [importType, setImportType] = useState(initialDocumentType)
  const [suggestions, setSuggestions] = useState<WriterTypeSuggestion[]>([])
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>(() => getDefaultPresetIds(presets, initialDocumentType))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const entryModeCopy: Record<
    EntryMode,
    {
      label: string
      shortLabel: string
      description: string
      steps: string[]
    }
  > = {
    conversation: {
      label: t('entryModes.conversation.label'),
      shortLabel: t('entryModes.conversation.shortLabel'),
      description: t('entryModes.conversation.description'),
      steps: [
        t('entryModes.conversation.steps.one'),
        t('entryModes.conversation.steps.two'),
        t('entryModes.conversation.steps.three'),
      ],
    },
    import: {
      label: t('entryModes.import.label'),
      shortLabel: t('entryModes.import.shortLabel'),
      description: t('entryModes.import.description'),
      steps: [
        t('entryModes.import.steps.one'),
        t('entryModes.import.steps.two'),
        t('entryModes.import.steps.three'),
      ],
    },
  }

  const activeDocumentType = entryMode === 'conversation' ? documentType : importType
  const selectedMode = entryModeCopy[entryMode]
  const schemaLabelMap = useMemo(() => new Map(schemas.map((schema) => [schema.documentType, schema.title])), [schemas])
  const presetMap = useMemo(() => new Map(presets.map((preset) => [preset.id, preset])), [presets])
  const availablePresets = useMemo(
    () => presets.filter((preset) => isPresetAvailableForType(preset, activeDocumentType)),
    [activeDocumentType, presets]
  )
  const selectedTypeLabel = schemaLabelMap.get(activeDocumentType) ?? commonT(`documentTypes.${activeDocumentType}`)
  const selectedProviderName = providerId ? providers.find((provider) => provider.id === providerId)?.name ?? providerId : t('fields.providerAuto')
  const selectedPresetCount = selectedPresetIds.filter((presetId) => {
    const preset = presetMap.get(presetId)
    return preset ? isPresetAvailableForType(preset, activeDocumentType) : false
  }).length
  const canClassify = sourceText.trim().length > 0
  const canCreate = title.trim().length > 0 || sourceText.trim().length > 0
  const canImport = importLookup.trim().length > 0

  useEffect(() => {
    setSelectedPresetIds((current) => {
      const kept = current.filter((presetId) => {
        const preset = presetMap.get(presetId)
        if (!preset?.enabled) return false
        if (preset.scope === 'documentType' && preset.documentType !== activeDocumentType) return false
        return true
      })

      const next = [...kept]
      for (const presetId of getDefaultPresetIds(presets, activeDocumentType)) {
        if (!next.includes(presetId)) {
          next.push(presetId)
        }
      }

      return next
    })
  }, [activeDocumentType, presetMap, presets])

  function togglePreset(presetId: string) {
    setSelectedPresetIds((current) => (current.includes(presetId) ? current.filter((id) => id !== presetId) : [...current, presetId]))
  }

  async function handleClassify() {
    if (!sourceText.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/writer/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: sourceText }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? t('errors.classifyFailed'))
        return
      }

      setSuggestions(data)
      if (data[0]?.documentType) {
        setDocumentType(data[0].documentType)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/writer/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          sourceText,
          documentType,
          providerId,
          presetIds: selectedPresetIds,
          workflowMode: 'conversation',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? t('errors.createFailed'))
        return
      }

      router.push(withLocalePrefix(`/writer/${data.id}`, activeLocale))
    } finally {
      setLoading(false)
    }
  }

  async function handleImport(lookup = importLookup, type = importType) {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/writer/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lookup,
          documentType: type,
          providerId,
          presetIds: selectedPresetIds,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? t('errors.importFailed'))
        return
      }

      router.push(withLocalePrefix(`/writer/${data.id}`, activeLocale))
    } finally {
      setLoading(false)
    }
  }

  function getPresetScopeLabel(preset: WriterPromptPreset) {
    return commonT(`presetScopes.${preset.scope}`)
  }

  return (
    <div className='space-y-6'>
      <section className='overflow-hidden rounded-[32px] border border-border bg-card shadow-sm'>
        <div className='grid gap-8 px-6 py-7 lg:px-8 lg:py-8 xl:grid-cols-[1.2fr_0.8fr]'>
          <div>
            <p className='text-xs uppercase tracking-[0.32em] text-muted-foreground'>{t('heroKicker')}</p>
            <h1 className='mt-4 max-w-4xl text-3xl font-semibold tracking-tight lg:text-4xl'>{t('heroTitle')}</h1>
            <p className='mt-4 max-w-3xl text-sm leading-7 text-muted-foreground'>{t('heroDescription')}</p>

            <div className='mt-6 grid gap-3 md:grid-cols-3'>
              <div className='rounded-2xl border border-border bg-background/70 p-4'>
                <div className='text-xs uppercase tracking-[0.24em] text-muted-foreground'>{t('summary.step1Kicker')}</div>
                <div className='mt-2 text-base font-semibold'>{t('summary.step1Title')}</div>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>{t('summary.step1Description')}</p>
              </div>
              <div className='rounded-2xl border border-border bg-background/70 p-4'>
                <div className='text-xs uppercase tracking-[0.24em] text-muted-foreground'>{t('summary.step2Kicker')}</div>
                <div className='mt-2 text-base font-semibold'>{t('summary.step2Title')}</div>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>{t('summary.step2Description')}</p>
              </div>
              <div className='rounded-2xl border border-border bg-background/70 p-4'>
                <div className='text-xs uppercase tracking-[0.24em] text-muted-foreground'>{t('summary.step3Kicker')}</div>
                <div className='mt-2 text-base font-semibold'>{t('summary.step3Title')}</div>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>{t('summary.step3Description')}</p>
              </div>
            </div>
          </div>

          <div className='rounded-[28px] border border-border bg-gradient-to-br from-background to-muted/40 p-6'>
            <div className='text-xs uppercase tracking-[0.28em] text-muted-foreground'>{selectedMode.shortLabel}</div>
            <div className='mt-3 text-2xl font-semibold'>{selectedMode.label}</div>
            <p className='mt-3 text-sm leading-7 text-muted-foreground'>{selectedMode.description}</p>

            <div className='mt-6 space-y-3'>
              {selectedMode.steps.map((step) => (
                <div key={step} className='flex items-start gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3'>
                  <div className='mt-1 h-2.5 w-2.5 rounded-full bg-primary' />
                  <div className='text-sm leading-6 text-foreground/90'>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className='grid gap-6 xl:grid-cols-[1.18fr_0.82fr]'>
        <section className='rounded-[28px] border border-border bg-card p-6 shadow-sm lg:p-7'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div>
              <h2 className='text-2xl font-semibold'>{t('workspaceTitle')}</h2>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>{t('workspaceDescription')}</p>
            </div>
            <div className='rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground'>{t('workspaceBadge')}</div>
          </div>

          <div className='mt-6 grid gap-4 md:grid-cols-2'>
            {(['conversation', 'import'] as EntryMode[]).map((mode) => {
              const config = entryModeCopy[mode]
              const active = entryMode === mode

              return (
                <button
                  type='button'
                  key={mode}
                  onClick={() => setEntryMode(mode)}
                  className={`rounded-2xl border p-5 text-left transition ${active ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/40'}`}
                >
                  <div className='flex items-center justify-between gap-3'>
                    <div className='text-base font-semibold'>{config.label}</div>
                    <div className='text-xs uppercase tracking-[0.2em] text-muted-foreground'>{config.shortLabel}</div>
                  </div>
                  <p className='mt-2 text-sm leading-6 text-muted-foreground'>{config.description}</p>
                </button>
              )
            })}
          </div>

          {entryMode === 'conversation' ? (
            <div className='mt-6 space-y-5'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>{t('fields.titleLabel')}</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm'
                  placeholder={t('fields.titlePlaceholder')}
                />
                <p className='text-xs leading-6 text-muted-foreground'>{t('fields.titleHint')}</p>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>{t('fields.sourceLabel')}</label>
                <textarea
                  value={sourceText}
                  onChange={(event) => setSourceText(event.target.value)}
                  className='min-h-52 w-full rounded-xl border border-border bg-background px-4 py-4 text-sm leading-7'
                  placeholder={t('fields.sourcePlaceholder')}
                />
                <p className='text-xs leading-6 text-muted-foreground'>{t('fields.sourceHint')}</p>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>{t('fields.documentTypeLabel')}</label>
                  <select
                    value={documentType}
                    onChange={(event) => setDocumentType(event.target.value as typeof documentType)}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm'
                  >
                    {schemas.map((schema) => (
                      <option key={schema.documentType} value={schema.documentType}>
                        {schema.title}
                      </option>
                    ))}
                  </select>
                  <p className='text-xs leading-6 text-muted-foreground'>{t('fields.documentTypeHint')}</p>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>{t('fields.providerLabel')}</label>
                  <select
                    value={providerId}
                    onChange={(event) => setProviderId(event.target.value)}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm'
                  >
                    <option value=''>{t('fields.providerAuto')}</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  <p className='text-xs leading-6 text-muted-foreground'>{t('fields.providerHint')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className='mt-6 space-y-5'>
              <div className='rounded-[24px] border border-border bg-background/60 p-5'>
                <h3 className='text-lg font-semibold'>{t('fields.importTitle')}</h3>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>{t('fields.importDescription')}</p>

                <div className='mt-4 space-y-4'>
                  <ExistingEntryPicker
                    schemas={schemas}
                    selectedType={importType}
                    onSelectType={setImportType}
                    onImport={handleImport}
                    disabled={loading}
                  />

                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>{t('fields.importLookupLabel')}</label>
                      <input
                        value={importLookup}
                        onChange={(event) => setImportLookup(event.target.value)}
                        className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm'
                        placeholder={t('fields.importLookupPlaceholder')}
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>{t('fields.providerLabel')}</label>
                      <select
                        value={providerId}
                        onChange={(event) => setProviderId(event.target.value)}
                        className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm'
                      >
                        <option value=''>{t('fields.providerAuto')}</option>
                        {providers.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='mt-6 space-y-3 rounded-[24px] border border-border bg-background/60 p-5'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <div className='text-sm font-medium'>{t('presets.title')}</div>
                <p className='mt-1 text-xs leading-6 text-muted-foreground'>{t('presets.description')}</p>
              </div>
              <div className='rounded-full border border-border px-3 py-1 text-xs text-muted-foreground'>
                {t('presets.selectedCount', { count: selectedPresetCount })}
              </div>
            </div>

            {availablePresets.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground'>{t('presets.empty')}</div>
            ) : (
              <div className='grid gap-3'>
                {availablePresets.map((preset) => {
                  const checked = selectedPresetIds.includes(preset.id)

                  return (
                    <label
                      key={preset.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
                        checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      <input type='checkbox' checked={checked} onChange={() => togglePreset(preset.id)} className='mt-1' />
                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <div className='text-sm font-medium'>{preset.name}</div>
                          <span className='rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                            {getPresetScopeLabel(preset)}
                          </span>
                          {preset.scope === 'documentType' && preset.documentType ? (
                            <span className='rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground'>
                              {schemaLabelMap.get(preset.documentType) ?? commonT(`documentTypes.${preset.documentType}`)}
                            </span>
                          ) : null}
                        </div>
                        <p className='mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground'>{preset.content}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div className='mt-6 flex flex-wrap gap-3 pt-1'>
            {entryMode === 'conversation' ? (
              <>
                <button
                  type='button'
                  onClick={handleClassify}
                  disabled={loading || !canClassify}
                  className='rounded-xl border border-border px-4 py-3 text-sm disabled:opacity-60'
                >
                  {loading ? t('buttons.classifying') : t('buttons.classify')}
                </button>
                <button
                  type='button'
                  onClick={handleCreate}
                  disabled={loading || !canCreate}
                  className='rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground disabled:opacity-60'
                >
                  {loading ? t('buttons.creating') : t('buttons.create')}
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={() => handleImport()}
                disabled={loading || !canImport}
                className='rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground disabled:opacity-60'
              >
                {loading ? t('buttons.importing') : t('buttons.import')}
              </button>
            )}
          </div>

          {error ? <div className='mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>{error}</div> : null}
        </section>

        <aside className='space-y-6'>
          <section className='rounded-[28px] border border-border bg-card p-6 shadow-sm'>
            <div className='text-xs uppercase tracking-[0.28em] text-muted-foreground'>{t('preview.kicker')}</div>
            <h2 className='mt-3 text-xl font-semibold'>{t('preview.title')}</h2>
            <p className='mt-2 text-sm leading-6 text-muted-foreground'>{t('preview.description')}</p>

            <div className='mt-5 space-y-3'>
              <div className='rounded-2xl border border-border bg-background px-4 py-3'>
                <div className='text-xs uppercase tracking-[0.24em] text-muted-foreground'>{commonT('mode')}</div>
                <div className='mt-2 text-sm font-medium'>{selectedMode.label}</div>
              </div>
              <div className='rounded-2xl border border-border bg-background px-4 py-3'>
                <div className='text-xs uppercase tracking-[0.24em] text-muted-foreground'>{commonT('type')}</div>
                <div className='mt-2 text-sm font-medium'>{selectedTypeLabel}</div>
              </div>
              <div className='rounded-2xl border border-border bg-background px-4 py-3'>
                <div className='text-xs uppercase tracking-[0.24em] text-muted-foreground'>{commonT('provider')}</div>
                <div className='mt-2 text-sm font-medium'>{selectedProviderName}</div>
              </div>
              <div className='rounded-2xl border border-border bg-background px-4 py-3'>
                <div className='text-xs uppercase tracking-[0.24em] text-muted-foreground'>{commonT('presets')}</div>
                <div className='mt-2 text-sm font-medium'>
                  {selectedPresetCount > 0 ? t('preview.presetsEnabled', { count: selectedPresetCount }) : t('preview.presetsEmpty')}
                </div>
              </div>
            </div>

            <div className='mt-5 rounded-2xl border border-dashed border-border px-4 py-4 text-sm leading-6 text-muted-foreground'>
              {entryMode === 'conversation' ? t('preview.noteConversation') : t('preview.noteImport')}
            </div>
          </section>

          {entryMode === 'conversation' ? (
            <section className='rounded-[28px] border border-border bg-card p-6 shadow-sm'>
              <h2 className='text-lg font-semibold'>{t('aiSuggestions.title')}</h2>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>{t('aiSuggestions.description')}</p>

              {suggestions.length === 0 ? (
                <div className='mt-4 rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground'>{t('aiSuggestions.empty')}</div>
              ) : (
                <div className='mt-4 space-y-3'>
                  {suggestions.slice(0, 4).map((suggestion) => {
                    const active = suggestion.documentType === documentType

                    return (
                      <button
                        type='button'
                        key={suggestion.documentType}
                        onClick={() => setDocumentType(suggestion.documentType)}
                        className={`block w-full rounded-2xl border p-4 text-left transition ${active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}
                      >
                        <div className='flex items-center justify-between gap-3'>
                          <div className='font-medium'>{schemaLabelMap.get(suggestion.documentType) ?? commonT(`documentTypes.${suggestion.documentType}`)}</div>
                          <div className='text-xs text-muted-foreground'>{t('aiSuggestions.score', { score: suggestion.score.toFixed(2) })}</div>
                        </div>
                        <p className='mt-2 text-sm leading-6 text-muted-foreground'>{suggestion.reason}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          ) : (
            <section className='rounded-[28px] border border-border bg-card p-6 shadow-sm'>
              <h2 className='text-lg font-semibold'>{t('importInfo.title')}</h2>
              <div className='mt-4 space-y-3'>
                <div className='rounded-2xl border border-border bg-background px-4 py-4 text-sm leading-6 text-muted-foreground'>{t('importInfo.item1')}</div>
                <div className='rounded-2xl border border-border bg-background px-4 py-4 text-sm leading-6 text-muted-foreground'>{t('importInfo.item2')}</div>
                <div className='rounded-2xl border border-border bg-background px-4 py-4 text-sm leading-6 text-muted-foreground'>{t('importInfo.item3')}</div>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
