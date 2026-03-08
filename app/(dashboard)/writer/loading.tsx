import { getTranslations } from 'next-intl/server'

export default async function WriterLoading() {
  const t = await getTranslations('Writer.Loading')

  return (
    <div className='rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm'>
      {t('message')}
    </div>
  )
}
