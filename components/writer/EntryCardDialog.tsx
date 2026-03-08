'use client'

import { useEffect, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import type { WriterSchemaSummary, WriterSession } from '@/types/writer'
import { StructuredFieldEditor } from '@/components/writer/StructuredFieldEditor'
import { cn } from '@/lib/utils'

type EntryCardDialogProps = {
  open: boolean
  variant?: 'dialog' | 'panel'
  className?: string
  headerActions?: ReactNode
  closeButtonLabel?: string | null
  session: WriterSession
  schema: WriterSchemaSummary
  flashMessage?: string
  busyAction?: string
  canSubmit?: boolean
  submitDisabledReason?: string
  submitDisabledHint?: string
  filledFieldCount: number
  requiredFieldCount: number
  missingRequiredFields: string[]
  onClose: () => void
  onFieldChange: (fieldName: string, value: unknown) => void
  onToggleLock: (fieldName: string) => void
  onSave: () => Promise<void>
  onCheck: () => Promise<void>
  onCalibrate: () => Promise<void>
  onApplyAllCalibrationPatches: () => Promise<void>
  onSubmit: (action: 'saveDraft' | 'publish') => Promise<void>
}

export function EntryCardDialog({
  open,
  variant = 'dialog',
  className,
  headerActions,
  closeButtonLabel,
  session,
  schema,
  flashMessage,
  busyAction,
  canSubmit = true,
  submitDisabledReason,
  submitDisabledHint,
  filledFieldCount,
  requiredFieldCount,
  missingRequiredFields,
  onClose,
  onFieldChange,
  onToggleLock,
  onSave,
  onCheck,
  onCalibrate,
  onApplyAllCalibrationPatches,
  onSubmit,
}: EntryCardDialogProps) {
  const t = useTranslations('Writer.EntryCard')

  useEffect(() => {
    if (variant !== 'dialog' || !open) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open, variant])

  if (!open) return null

  const disabled = busyAction !== ''
  const issueCount = session.lastCheck?.issues.length ?? 0
  const patchCount = session.calibrationPatches?.length ?? 0
  const shouldShowCloseButton = variant === 'dialog' || closeButtonLabel !== null
  const submitDisabledMessage = !canSubmit ? submitDisabledReason ?? t('submitDisabledFallback') : ''

  const content = (
    <div className='flex h-full min-h-0 flex-col'>
      <header className='border-b border-border px-5 py-4'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='text-xs uppercase tracking-[0.24em] text-muted-foreground'>{t('kicker')}</div>
            <h2 className='mt-2 text-xl font-semibold'>{session.title}</h2>
            <div className='mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground'>
              <span>{schema.title}</span>
              <span>·</span>
              <span>{t('filled', { filled: filledFieldCount, total: schema.fields.length })}</span>
              <span>·</span>
              <span>{t('required', { filled: requiredFieldCount - missingRequiredFields.length, total: requiredFieldCount })}</span>
              <span>·</span>
              <span>{t('locked', { count: session.draft.lockedFields.length })}</span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {headerActions}
            {shouldShowCloseButton ? (
              <button type='button' onClick={onClose} className='rounded-lg border border-border px-3 py-2 text-sm'>
                {closeButtonLabel ?? (variant === 'panel' ? t('hideCard') : t('backToChat'))}
              </button>
            ) : null}
          </div>
        </div>

        {flashMessage ? (
          <div className='mt-4 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground/80'>{flashMessage}</div>
        ) : null}
      </header>

      <div className='flex-1 overflow-y-auto px-5 py-5'>
        <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
            <span className='rounded-full border border-border px-3 py-1'>{t('issues', { count: issueCount })}</span>
            <span className='rounded-full border border-border px-3 py-1'>{t('calibration', { count: patchCount })}</span>
            <span className='rounded-full border border-border px-3 py-1'>{canSubmit ? t('sanityEnabled') : t('sanityDisabled')}</span>
          </div>

          {missingRequiredFields.length > 0 ? (
            <div className='mt-4 rounded-xl border border-amber-300/60 bg-amber-500/5 px-4 py-3 text-sm text-foreground/80'>
              <div className='font-medium text-amber-700 dark:text-amber-300'>{t('missingRequiredTitle')}</div>
              <div className='mt-2'>{missingRequiredFields.join(', ')}</div>
            </div>
          ) : (
            <div className='mt-4 rounded-xl border border-emerald-300/60 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300'>
              {t('allRequiredPresent')}
            </div>
          )}

          {session.lastCheck?.issues && session.lastCheck.issues.length > 0 ? (
            <div className='mt-4 space-y-2'>
              {session.lastCheck.issues.slice(0, 6).map((issue) => (
                <div key={issue.id} className='rounded-xl border border-border px-4 py-3 text-sm'>
                  <div className='font-medium'>{issue.message}</div>
                  <div className='mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                    {issue.level} · {issue.code}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className='mt-5'>
          <StructuredFieldEditor
            schema={schema}
            fields={session.draft.fields}
            lockedFields={session.draft.lockedFields}
            onFieldChange={onFieldChange}
            onToggleLock={onToggleLock}
          />
        </div>
      </div>

      <footer className='border-t border-border px-5 py-4'>
        {submitDisabledMessage ? (
          <div className='mb-3 rounded-xl border border-amber-300/60 bg-amber-500/5 px-4 py-3 text-sm text-foreground/80'>
            <div className='font-medium text-amber-700 dark:text-amber-300'>{t('submitDisabledTitle')}</div>
            <div className='mt-1 leading-6'>{submitDisabledMessage}</div>
            {submitDisabledHint ? <div className='mt-2 text-xs text-muted-foreground'>{submitDisabledHint}</div> : null}
          </div>
        ) : null}
        <div className='flex flex-wrap items-center gap-3'>
          <button type='button' onClick={onSave} disabled={disabled} className='rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60'>
            {t('saveLocal')}
          </button>
          <button type='button' onClick={onCheck} disabled={disabled} className='rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60'>
            {t('runChecks')}
          </button>
          <button type='button' onClick={onCalibrate} disabled={disabled} className='rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60'>
            {t('aiCalibrate')}
          </button>
          <button
            type='button'
            onClick={onApplyAllCalibrationPatches}
            disabled={disabled || patchCount === 0}
            className='rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60'
          >
            {t('applyAllFixes')}
          </button>
          <button
            type='button'
            onClick={() => onSubmit('saveDraft')}
            disabled={disabled || !canSubmit}
            title={submitDisabledMessage || undefined}
            className='rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60'
          >
            {t('pushDraft')}
          </button>
          <button
            type='button'
            onClick={() => onSubmit('publish')}
            disabled={disabled || !canSubmit}
            title={submitDisabledMessage || undefined}
            className='rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60'
          >
            {t('publishNow')}
          </button>
        </div>
      </footer>
    </div>
  )

  if (variant === 'panel') {
    return <div className={cn('flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-border bg-background shadow-sm', className)}>{content}</div>
  }

  return (
    <div className='fixed inset-0 z-50'>
      <button type='button' aria-label={t('closeOverlayAria')} onClick={onClose} className='absolute inset-0 bg-black/40' />

      <div
        className={cn(
          'absolute bottom-4 left-4 right-4 top-4 overflow-hidden rounded-[28px] border border-border bg-background shadow-2xl md:bottom-6 md:left-6 md:right-auto md:top-6 md:w-[min(820px,calc(100vw-3rem))]',
          className
        )}
      >
        {content}
      </div>
    </div>
  )
}
