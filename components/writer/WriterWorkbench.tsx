'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type {
  WriterConversationIntent,
  WriterDocumentType,
  WriterMessage,
  WriterPromptPreset,
  WriterProviderSummary,
  WriterSchemaSummary,
  WriterSession,
} from '@/types/writer'
import { ConversationTimeline } from '@/components/writer/ConversationTimeline'
import { EntryCardDialog } from '@/components/writer/EntryCardDialog'
import { getWriterDraftFieldProgress } from '@/lib/writer/draft-fields'
import { createConceptCard } from '@/lib/writer/workflow/conversation'
import { buildOutlineExpansionInstruction, pickOutlineBlocksForExpansion } from '@/lib/writer/workflow/expand'

type WriterWorkbenchProps = {
  initialSession: WriterSession
  schema: WriterSchemaSummary
  providers: WriterProviderSummary[]
  presets: WriterPromptPreset[]
  homePath: string
}

function PaneRail(props: {
  title: string
  meta: string
  description: string
  onExpand: () => void
  expandLabel: string
}) {
  const { title, meta, description, onExpand, expandLabel } = props

  return (
    <div className='flex h-full w-full flex-col justify-between bg-background px-3 py-4 lg:w-20 lg:flex-none'>
      <div>
        <div className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>{title}</div>
        <div className='mt-3 text-sm font-semibold'>{meta}</div>
        <div className='mt-2 text-xs leading-5 text-muted-foreground'>{description}</div>
      </div>
      <div className='flex flex-col gap-2'>
        <button type='button' onClick={onExpand} className='rounded-xl border border-border px-3 py-2 text-xs'>
          {expandLabel}
        </button>
      </div>
    </div>
  )
}

export function WriterWorkbench({ initialSession, schema, providers, presets, homePath }: WriterWorkbenchProps) {
  const router = useRouter()
  const t = useTranslations('Writer.Workbench')
  const commonT = useTranslations('Writer.Common')
  const [session, setSession] = useState(initialSession)
  const [chatInput, setChatInput] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const [flashMessage, setFlashMessage] = useState('')
  const [isCardCollapsed, setIsCardCollapsed] = useState(false)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const [sanityWriteStatus, setSanityWriteStatus] = useState<{
    enabled: boolean
    missingEnvVars: string[]
    reason: string
    hint: string
  }>({
    enabled: true,
    missingEnvVars: [],
    reason: '',
    hint: '',
  })
  const [presetPickerOpen, setPresetPickerOpen] = useState(false)
  const [optimisticMessages, setOptimisticMessages] = useState<WriterMessage[] | null>(null)

  const workflowMode = session.workflowMode ?? 'conversation'
  const isBusy = busyAction !== ''

  const availablePresets = useMemo(
    () => presets.filter((preset) => preset.scope !== 'documentType' || preset.documentType === session.documentType),
    [presets, session.documentType]
  )

  const activePresets = useMemo(
    () => availablePresets.filter((preset) => session.presetIds.includes(preset.id)),
    [availablePresets, session.presetIds]
  )

  const conceptCard = useMemo(
    () =>
      session.conceptCard ??
      createConceptCard({
        title: session.title,
        sourceText: session.draft.sourceText,
        documentType: session.documentType,
      }),
    [session.conceptCard, session.documentType, session.draft.sourceText, session.title]
  )

  const { filledFieldCount, missingRequiredFields } = useMemo(
    () => getWriterDraftFieldProgress(schema, session.draft.fields),
    [schema, session.draft.fields]
  )
  const displayedMessages = optimisticMessages ?? session.messages
  const requiredFieldCount = schema.fields.filter((field) => field.required).length
  const canSubmit = sanityWriteStatus.enabled

  useEffect(() => {
    let active = true

    fetch('/api/writer/config')
      .then(async (response) => {
        const data = await response.json()
        if (!active || !response.ok) return
        const nextStatus = data.sanityWrite
        setSanityWriteStatus({
          enabled: Boolean(nextStatus?.enabled ?? data.canSubmit),
          missingEnvVars: Array.isArray(nextStatus?.missingEnvVars)
            ? nextStatus.missingEnvVars.filter((value: unknown): value is string => typeof value === 'string')
            : [],
          reason: typeof nextStatus?.reason === 'string' ? nextStatus.reason : '',
          hint: typeof nextStatus?.hint === 'string' ? nextStatus.hint : '',
        })
      })
      .catch(() => undefined)

    fetch(`/api/writer/sessions/${initialSession.id}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json()
        if (!active || !response.ok) return
        setSession(data)
        setOptimisticMessages(null)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [initialSession.id])

  function getDocumentTypeLabel(type: WriterDocumentType) {
    return commonT(`documentTypes.${type}`)
  }

  function toggleCardPaneCollapsed() {
    setIsCardCollapsed((current) => !current)
  }

  function toggleChatPaneCollapsed() {
    setIsChatCollapsed((current) => !current)
  }

  async function patchSession(payload: Record<string, unknown>) {
    const response = await fetch(`/api/writer/sessions/${session.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (response.ok) {
      setSession(data)
    }

    return { response, data }
  }

  async function syncSessionState(overrides: Record<string, unknown> = {}) {
    return patchSession({
      title: session.title,
      providerId: session.providerId,
      presetIds: session.presetIds,
      workflowMode,
      stage: session.stage,
      messages: session.messages,
      draft: session.draft,
      conceptCard: session.conceptCard,
      outline: session.outline,
      calibrationPatches: session.calibrationPatches,
      ...overrides,
    })
  }

  function handleFieldChange(fieldName: string, value: unknown) {
    setSession((current) => ({
      ...current,
      calibrationPatches: [],
      draft: {
        ...current.draft,
        fields: {
          ...current.draft.fields,
          [fieldName]: value,
        },
      },
    }))
  }

  function handleToggleLock(fieldName: string) {
    setSession((current) => {
      const isLocked = current.draft.lockedFields.includes(fieldName)
      return {
        ...current,
        draft: {
          ...current.draft,
          lockedFields: isLocked ? current.draft.lockedFields.filter((name) => name !== fieldName) : [...current.draft.lockedFields, fieldName],
        },
      }
    })
  }

  async function handleDeleteDraft() {
    const confirmed = window.confirm(t('deleteConfirm', { title: session.title }))
    if (!confirmed) return

    setBusyAction('delete')

    try {
      const response = await fetch(`/api/writer/sessions/${session.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setFlashMessage(data?.error ?? t('deleteFailed'))
        setBusyAction('')
        return
      }

      router.push(homePath)
      router.refresh()
      return
    } catch {
      setFlashMessage(t('deleteFailed'))
    }

    setBusyAction('')
  }

  async function handleSave() {
    setBusyAction('save')
    const { response, data } = await syncSessionState()
    setFlashMessage(response.ok ? t('savedLocally') : (data.error ?? t('saveFailed')))
    setBusyAction('')
  }

  async function handleCheck() {
    setBusyAction('check')
    const saved = await syncSessionState()
    if (!saved.response.ok) {
      setFlashMessage(saved.data.error ?? t('saveFailedBeforeCheck'))
      setBusyAction('')
      return
    }

    const response = await fetch('/api/writer/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: session.id }),
    })
    const data = await response.json()
    if (response.ok && data.session) {
      setSession(data.session)
      setFlashMessage(t('checkCompleted'))
    } else {
      setFlashMessage(data.error ?? t('checkFailed'))
    }
    setBusyAction('')
  }

  function getDefaultInstruction() {
    const selectedBlocks = pickOutlineBlocksForExpansion(session)

    if (selectedBlocks.length > 0) {
      return buildOutlineExpansionInstruction({
        schema,
        blocks: selectedBlocks,
      })
    }

    return `Generate a complete ${schema.title} draft from the current chat and card context, prioritizing required fields and body content.`
  }

  async function handleGenerate(mode: 'scaffold' | 'rewrite' | 'fill-missing') {
    const activeInstruction = getDefaultInstruction()
    const selectedOutlineBlocks = pickOutlineBlocksForExpansion(session)

    setBusyAction('generate')
    const saved = await syncSessionState()
    if (!saved.response.ok) {
      setFlashMessage(saved.data.error ?? t('generationFailed'))
      setBusyAction('')
      return
    }

    try {
      const response = await fetch('/api/writer/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          instruction: activeInstruction,
          mode,
          outlineBlockIds: selectedOutlineBlocks.map((block) => block.id),
        }),
      })
      const data = await response.json()
      if (response.ok && data.session) {
        setSession(data.session)
        setFlashMessage(
          data.appliedFieldNames?.length > 0
            ? t('generationUpdatedFields', { count: data.appliedFieldNames.length })
            : t('generationFinished')
        )
      } else {
        setFlashMessage(data.error ?? data.message ?? t('generationFailed'))
      }
    } catch {
      setFlashMessage(t('generationRequestFailed'))
    }

    setBusyAction('')
  }

  async function handleChat(intent: WriterConversationIntent) {
    const inputValue = chatInput.trim()
    if (!inputValue) return

    const now = new Date().toISOString()
    const optimisticUserMessage: WriterMessage = {
      id: `optimistic-user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      createdAt: now,
    }
    const optimisticAssistantMessage: WriterMessage = {
      id: `optimistic-assistant-${Date.now()}`,
      role: 'assistant',
      content: t('optimisticThinking'),
      createdAt: now,
    }

    setOptimisticMessages([...session.messages, optimisticUserMessage, optimisticAssistantMessage])
    setChatInput('')
    setBusyAction('chat')

    const saved = await syncSessionState()
    if (!saved.response.ok) {
      setOptimisticMessages([
        ...session.messages,
        optimisticUserMessage,
        {
          ...optimisticAssistantMessage,
          content: saved.data.error ?? t('messageSendFailed'),
        },
      ])
      setChatInput(inputValue)
      setFlashMessage(saved.data.error ?? t('saveFailedBeforeChat'))
      setBusyAction('')
      return
    }

    try {
      const response = await fetch('/api/writer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          input: inputValue,
          intent,
        }),
      })

      const data = await response.json()
      if (response.ok && data.session) {
        setSession(data.session)
        setOptimisticMessages(null)
        setFlashMessage(
          data.appliedFieldNames?.length > 0
            ? t('chatSyncedFields', { count: data.appliedFieldNames.length })
            : t('chatUpdatedUnderstanding')
        )
      } else {
        setOptimisticMessages([
          ...session.messages,
          optimisticUserMessage,
          {
            ...optimisticAssistantMessage,
            content: data.error ?? data.message ?? t('chatFailedInline'),
          },
        ])
        setChatInput(inputValue)
        setFlashMessage(data.error ?? data.message ?? t('chatFailed'))
      }
    } catch {
      setOptimisticMessages([
        ...session.messages,
        optimisticUserMessage,
        {
          ...optimisticAssistantMessage,
          content: t('chatNetworkInline'),
        },
      ])
      setChatInput(inputValue)
      setFlashMessage(t('chatRequestFailed'))
    }

    setBusyAction('')
  }

  async function handleCalibrate() {
    setBusyAction('calibrate')
    const saved = await syncSessionState()
    if (!saved.response.ok) {
      setFlashMessage(saved.data.error ?? t('saveFailedBeforeCalibration'))
      setBusyAction('')
      return
    }

    try {
      const response = await fetch('/api/writer/calibrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: session.id }),
      })

      const data = await response.json()
      if (response.ok && data.session) {
        setSession(data.session)
        setFlashMessage(data.patches?.length ? t('calibrationGenerated', { count: data.patches.length }) : t('calibrationNone'))
      } else {
        setFlashMessage(data.error ?? t('calibrationFailed'))
      }
    } catch {
      setFlashMessage(t('calibrationRequestFailed'))
    }

    setBusyAction('')
  }

  async function handleApplyAllCalibrationPatches() {
    if (!session.calibrationPatches || session.calibrationPatches.length === 0) return

    setBusyAction('apply-patch')

    try {
      const response = await fetch('/api/writer/patches/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
        }),
      })

      const data = await response.json()
      if (response.ok && data.session) {
        setSession(data.session)
        setFlashMessage(t('applyAllSucceeded'))
      } else {
        setFlashMessage(data.error ?? t('applyAllFailed'))
      }
    } catch {
      setFlashMessage(t('applyAllRequestFailed'))
    }

    setBusyAction('')
  }

  async function handleSubmit(action: 'saveDraft' | 'publish') {
    if (!canSubmit) {
      setFlashMessage(sanityWriteStatus.reason || t('sanityUnavailable'))
      return
    }

    setBusyAction('submit')
    const saved = await syncSessionState()
    if (!saved.response.ok) {
      setFlashMessage(saved.data.error ?? t('saveFailedBeforeSubmit'))
      setBusyAction('')
      return
    }

    try {
      const response = await fetch('/api/writer/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          action,
        }),
      })
      const data = await response.json()
      if (response.ok && data.session) {
        setSession(data.session)
        setFlashMessage(action === 'publish' ? t('published') : t('pushedDraft'))
      } else {
        if (data.error === 'sanity_write_disabled') {
          setSanityWriteStatus({
            enabled: false,
            missingEnvVars: Array.isArray(data.missingEnvVars)
              ? data.missingEnvVars.filter((value: unknown): value is string => typeof value === 'string')
              : [],
            reason: typeof data.message === 'string' ? data.message : t('sanityUnavailable'),
            hint: typeof data.hint === 'string' ? data.hint : '',
          })
        }

        setFlashMessage(data.message ?? data.error ?? t('submitFailed'))
      }
    } catch {
      setFlashMessage(t('submitRequestFailed'))
    }

    setBusyAction('')
  }

  const candidateType = conceptCard.candidateTypes[0]?.documentType ?? session.documentType

  return (
    <div className='h-[calc(100vh-9rem)] min-h-[720px] overflow-hidden rounded-[30px] border border-border bg-[#f6f6f8] shadow-sm dark:bg-slate-950'>
      <div className='flex h-full flex-col lg:flex-row'>
        {isCardCollapsed ? (
          <div className='border-b border-border lg:border-b-0 lg:border-r'>
            <PaneRail
              title={t('entryRailTitle')}
              meta={`${filledFieldCount}/${schema.fields.length}`}
              description={t('entryCollapsed')}
              onExpand={toggleCardPaneCollapsed}
              expandLabel={t('expand')}
            />
          </div>
        ) : (
          <section className='flex min-h-0 min-w-0 flex-1 basis-1/2 flex-col border-b border-border bg-[#f8f8fb] lg:border-b-0 lg:border-r dark:bg-slate-900'>
            <EntryCardDialog
              variant='panel'
              className='h-full rounded-none border-0 bg-transparent shadow-none'
              open={true}
              session={session}
              schema={schema}
              flashMessage={undefined}
              busyAction={busyAction}
              canSubmit={canSubmit}
              submitDisabledReason={canSubmit ? undefined : sanityWriteStatus.reason || undefined}
              submitDisabledHint={canSubmit ? undefined : sanityWriteStatus.hint || undefined}
              filledFieldCount={filledFieldCount}
              requiredFieldCount={requiredFieldCount}
              missingRequiredFields={missingRequiredFields.map((field) => field.title)}
              headerActions={
                <button type='button' onClick={toggleCardPaneCollapsed} className='rounded-lg border border-border px-3 py-2 text-sm'>
                  {t('collapse')}
                </button>
              }
              closeButtonLabel={null}
              onClose={() => undefined}
              onFieldChange={handleFieldChange}
              onToggleLock={handleToggleLock}
              onSave={handleSave}
              onCheck={handleCheck}
              onCalibrate={handleCalibrate}
              onApplyAllCalibrationPatches={handleApplyAllCalibrationPatches}
              onSubmit={handleSubmit}
            />
          </section>
        )}

        {isChatCollapsed ? (
          <div className='border-t border-border lg:border-l lg:border-t-0'>
            <PaneRail
              title={t('chatRailTitle')}
              meta={`${displayedMessages.length}`}
              description={t('chatCollapsed')}
              onExpand={toggleChatPaneCollapsed}
              expandLabel={t('expand')}
            />
          </div>
        ) : (
          <section className='flex min-h-0 min-w-0 flex-1 basis-1/2 flex-col bg-background'>
            <header className='border-b border-border px-5 py-4'>
              <div className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
                <div>
                  <div className='text-xl font-semibold'>{t('headerTitle')}</div>
                  <div className='mt-1 text-sm text-muted-foreground'>{t('currentContext', { title: session.title })}</div>
                  <div className='mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground'>
                    <span className='rounded-full border border-border px-3 py-1'>{schema.title}</span>
                    <span className='rounded-full border border-border px-3 py-1'>
                      {t('candidateType', { type: getDocumentTypeLabel(candidateType) })}
                    </span>
                  </div>
                </div>

                <div className='flex flex-wrap items-center justify-end gap-2'>
                  <div className='rounded-xl border border-border bg-card px-3 py-2'>
                    <div className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>{t('model')}</div>
                    <select
                      value={session.providerId ?? ''}
                      onChange={(event) => setSession((current) => ({ ...current, providerId: event.target.value || undefined }))}
                      className='mt-1 min-w-36 bg-transparent text-sm outline-none'
                    >
                      <option value=''>{commonT('auto')}</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => setPresetPickerOpen((current) => !current)}
                      className='rounded-xl border border-border bg-card px-4 py-3 text-sm'
                    >
                      {t('presetsButton', { count: activePresets.length })}
                    </button>

                    {presetPickerOpen ? (
                      <div className='absolute right-0 top-[calc(100%+0.5rem)] z-30 w-80 rounded-2xl border border-border bg-card p-4 shadow-xl'>
                        <div className='text-sm font-medium'>{t('promptPresetsTitle')}</div>
                        <p className='mt-1 text-xs leading-6 text-muted-foreground'>{t('promptPresetsDescription')}</p>
                        <div className='mt-4 max-h-72 space-y-3 overflow-y-auto pr-1'>
                          {availablePresets.length === 0 ? (
                            <div className='rounded-xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground'>{t('noPresets')}</div>
                          ) : (
                            availablePresets.map((preset) => {
                              const checked = session.presetIds.includes(preset.id)
                              return (
                                <label key={preset.id} className='flex items-start gap-3 rounded-xl border border-border px-4 py-3'>
                                  <input
                                    type='checkbox'
                                    checked={checked}
                                    onChange={(event) =>
                                      setSession((current) => ({
                                        ...current,
                                        presetIds: event.target.checked
                                          ? [...new Set([...current.presetIds, preset.id])]
                                          : current.presetIds.filter((id) => id !== preset.id),
                                      }))
                                    }
                                    className='mt-1'
                                  />
                                  <div>
                                    <div className='text-sm font-medium'>{preset.name}</div>
                                    <div className='mt-1 text-xs leading-6 text-muted-foreground'>{preset.content}</div>
                                  </div>
                                </label>
                              )
                            })
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type='button'
                    onClick={handleDeleteDraft}
                    disabled={isBusy}
                    className='rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 disabled:opacity-60 dark:border-red-800 dark:text-red-300'
                  >
                    {busyAction === 'delete' ? t('deleting') : t('deleteDraft')}
                  </button>
                  <button type='button' onClick={toggleChatPaneCollapsed} className='rounded-lg border border-border px-3 py-2 text-sm'>
                    {t('collapse')}
                  </button>
                </div>
              </div>

              {flashMessage ? <div className='mt-4 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground/80'>{flashMessage}</div> : null}
            </header>
            <ConversationTimeline
              messages={displayedMessages}
              value={chatInput}
              disabled={isBusy}
              composerToolbar={
                <div className='flex flex-wrap items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => handleGenerate('fill-missing')}
                    disabled={isBusy}
                    className='rounded-full border border-border px-3 py-2 text-sm disabled:opacity-60'
                  >
                    {t('fillMissing')}
                  </button>
                  <button
                    type='button'
                    onClick={() => handleGenerate('rewrite')}
                    disabled={isBusy}
                    className='rounded-full border border-border px-3 py-2 text-sm disabled:opacity-60'
                  >
                    {t('rewrite')}
                  </button>
                  <button
                    type='button'
                    onClick={() => handleGenerate('scaffold')}
                    disabled={isBusy}
                    className='rounded-full bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-60'
                  >
                    {t('fullDraft')}
                  </button>
                </div>
              }
              onChange={setChatInput}
              onSend={() => handleChat('explore')}
            />
          </section>
        )}
      </div>
    </div>
  )
}
