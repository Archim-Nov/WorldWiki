'use client'

import { useTranslations } from 'next-intl'

export default function WriterError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  const t = useTranslations('Writer.Error')

  return (
    <div className='rounded-2xl border border-destructive/30 bg-card p-6 shadow-sm'>
      <h1 className='text-xl font-semibold text-destructive'>{t('title')}</h1>
      <p className='mt-3 text-sm text-muted-foreground'>{error.message}</p>
      <button type='button' onClick={reset} className='mt-4 rounded-lg border border-border px-4 py-2 text-sm'>
        {t('retry')}
      </button>
    </div>
  )
}
