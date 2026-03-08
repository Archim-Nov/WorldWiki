'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { WriterSession } from '@/types/writer'

type WriterOverviewProps = {
  sessions: WriterSession[]
  basePath: string
}

export function WriterOverview({ sessions, basePath }: WriterOverviewProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('Writer.Overview')
  const commonT = useTranslations('Writer.Common')
  const [localSessions, setLocalSessions] = useState(sessions)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const latestUpdatedAt = useMemo(() => {
    if (!localSessions[0]?.updatedAt) return commonT('none')
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(localSessions[0].updatedAt))
  }, [commonT, locale, localSessions])

  async function handleDeleteSession(session: WriterSession) {
    const confirmed = window.confirm(t('deleteConfirm', { title: session.title }))
    if (!confirmed) return

    setDeletingId(session.id)

    try {
      const response = await fetch(`/api/writer/sessions/${session.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        window.alert(data?.error ?? t('deleteFailed'))
        return
      }

      setLocalSessions((current) => current.filter((item) => item.id !== session.id))
      router.refresh()
    } catch {
      window.alert(t('deleteFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  function getDocumentTypeLabel(type: WriterSession['documentType']) {
    return commonT(`documentTypes.${type}`)
  }

  return (
    <div className='space-y-6'>
      <div className='overflow-hidden rounded-[32px] border border-border bg-card shadow-sm'>
        <div className='grid gap-8 px-6 py-7 lg:px-8 lg:py-8 xl:grid-cols-[1.15fr_0.85fr]'>
          <div>
            <p className='text-xs uppercase tracking-[0.32em] text-muted-foreground'>{t('kicker')}</p>
            <h1 className='mt-4 max-w-4xl text-3xl font-semibold tracking-tight lg:text-4xl'>{t('title')}</h1>
            <p className='mt-4 max-w-3xl text-sm leading-7 text-muted-foreground'>{t('description')}</p>
            <div className='mt-6 flex flex-wrap gap-3'>
              <Link href={`${basePath}/new`} className='rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground'>
                {t('primaryAction')}
              </Link>
              <Link href={`${basePath}/settings`} className='rounded-xl border border-border px-5 py-3 text-sm'>
                {t('secondaryAction')}
              </Link>
            </div>
          </div>

          <div className='rounded-[28px] border border-border bg-gradient-to-br from-background to-muted/40 p-6'>
            <div className='text-xs uppercase tracking-[0.28em] text-muted-foreground'>{t('howItWorksKicker')}</div>
            <div className='mt-3 text-2xl font-semibold'>{t('howItWorksTitle')}</div>
            <div className='mt-5 space-y-3'>
              <div className='rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm leading-6 text-foreground/90'>1. {t('howItWorksStep1')}</div>
              <div className='rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm leading-6 text-foreground/90'>2. {t('howItWorksStep2')}</div>
              <div className='rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm leading-6 text-foreground/90'>3. {t('howItWorksStep3')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-border bg-card p-5'>
          <div className='text-sm text-muted-foreground'>{t('statsDrafts')}</div>
          <div className='mt-2 text-3xl font-semibold'>{localSessions.length}</div>
        </div>
        <div className='rounded-2xl border border-border bg-card p-5'>
          <div className='text-sm text-muted-foreground'>{t('statsUpdated')}</div>
          <div className='mt-2 text-sm font-medium'>{latestUpdatedAt}</div>
        </div>
        <div className='rounded-2xl border border-border bg-card p-5'>
          <div className='text-sm text-muted-foreground'>{t('statsWorkflow')}</div>
          <div className='mt-2 text-sm font-medium'>{t('statsWorkflowValue')}</div>
        </div>
      </div>

      <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h2 className='text-xl font-semibold'>{t('recentTitle')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('recentDescription')}</p>
          </div>
        </div>

        <div className='mt-5 space-y-3'>
          {localSessions.length === 0 ? (
            <div className='rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground'>{t('emptySessions')}</div>
          ) : (
            localSessions.map((session) => (
              <div key={session.id} className='flex flex-col gap-3 rounded-xl border border-border px-4 py-4 md:flex-row md:items-start md:justify-between'>
                <Link href={`${basePath}/${session.id}`} className='block min-w-0 flex-1 rounded-lg transition hover:bg-muted/30'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='min-w-0'>
                      <div className='truncate text-base font-medium'>{session.title}</div>
                      <div className='mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground'>{getDocumentTypeLabel(session.documentType)}</div>
                    </div>
                    <div className='text-xs text-muted-foreground'>{session.status}</div>
                  </div>
                  <div className='mt-3 line-clamp-2 text-sm text-muted-foreground'>{session.draft.sourceText || t('sourceFallback')}</div>
                </Link>

                <div className='flex items-center gap-2 md:pl-4'>
                  <Link href={`${basePath}/${session.id}`} className='rounded-lg border border-border px-3 py-2 text-sm'>
                    {t('openSession')}
                  </Link>
                  <button
                    type='button'
                    onClick={() => handleDeleteSession(session)}
                    disabled={deletingId === session.id}
                    className='rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 disabled:opacity-60 dark:border-red-800 dark:text-red-300'
                  >
                    {deletingId === session.id ? t('deletingDraft') : t('deleteDraft')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
