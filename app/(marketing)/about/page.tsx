import { getTranslations } from 'next-intl/server'

export default async function AboutPage() {
  const t = await getTranslations('AboutPage')

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('eyebrow')}</p>
        <h1 className="text-3xl font-semibold mt-4">{t('title')}</h1>
        <p className="text-muted-foreground mt-4">{t('intro')}</p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">{t('exploreTitle')}</h2>
          <p className="text-muted-foreground mt-3">{t('exploreDesc')}</p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">{t('structureTitle')}</h2>
          <p className="text-muted-foreground mt-3">{t('structureDesc')}</p>
        </div>
      </section>
    </div>
  )
}
