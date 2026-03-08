import { getTranslations } from 'next-intl/server'
import { PresetManager, ProviderManager } from '@/components/writer'
import { listPromptPresets } from '@/lib/writer/storage/presets'
import { listProviderSummaries } from '@/lib/writer/storage/providers'
import { listWriterSessions } from '@/lib/writer/storage/sessions'

export default async function WriterSettingsPage() {
  const t = await getTranslations('Writer.SettingsPage')
  const [providers, presets, sessions] = await Promise.all([listProviderSummaries(), listPromptPresets(), listWriterSessions()])

  const providerUsageCountById: Record<string, number> = {}
  const presetUsageCountById: Record<string, number> = {}

  for (const session of sessions) {
    if (session.providerId) {
      providerUsageCountById[session.providerId] = (providerUsageCountById[session.providerId] ?? 0) + 1
    }

    for (const presetId of new Set(session.presetIds)) {
      presetUsageCountById[presetId] = (presetUsageCountById[presetId] ?? 0) + 1
    }
  }

  return (
    <div className='space-y-8'>
      <div className='overflow-hidden rounded-[32px] border border-border bg-card shadow-sm'>
        <div className='grid gap-8 px-6 py-7 lg:px-8 lg:py-8 xl:grid-cols-[1.15fr_0.85fr]'>
          <div>
            <p className='text-xs uppercase tracking-[0.32em] text-muted-foreground'>{t('kicker')}</p>
            <h1 className='mt-4 text-3xl font-semibold tracking-tight lg:text-4xl'>{t('title')}</h1>
            <p className='mt-4 max-w-3xl text-sm leading-7 text-muted-foreground'>{t('description')}</p>
          </div>

          <div className='rounded-[28px] border border-border bg-gradient-to-br from-background to-muted/40 p-6'>
            <div className='text-xs uppercase tracking-[0.28em] text-muted-foreground'>{t('tipsKicker')}</div>
            <div className='mt-3 text-2xl font-semibold'>{t('tipsTitle')}</div>
            <div className='mt-5 space-y-3'>
              <div className='rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm leading-6 text-foreground/90'>
                1. {t('tip1')}
              </div>
              <div className='rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm leading-6 text-foreground/90'>
                2. {t('tip2')}
              </div>
              <div className='rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm leading-6 text-foreground/90'>
                3. {t('tip3')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProviderManager initialProviders={providers} usageCountById={providerUsageCountById} />
      <PresetManager initialPresets={presets} usageCountById={presetUsageCountById} />
    </div>
  )
}
