'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { placeholders } from '@/lib/placeholders'
import { LocalizedLink } from '@/components/i18n/LocalizedLink'
import styles from './page.module.css'

type CountryKind = 'nation' | 'organization'
type CountryFilter = 'all' | CountryKind

type Country = {
  _id: string
  name: string
  slug: { current: string }
  kind?: CountryKind
  summary?: string
  mapImage?: string
}

function filterButtonClass(active: boolean) {
  return [
    'inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-sm transition',
    active
      ? 'border-primary bg-primary text-primary-foreground'
      : 'border-border bg-background/70 text-foreground hover:bg-accent',
  ].join(' ')
}

function renderCountrySection(kind: CountryKind, items: Country[], t: ReturnType<typeof useTranslations>) {
  const isOrganization = kind === 'organization'

  if (items.length === 0) {
    return (
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{isOrganization ? t('organization') : t('nation')}</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {isOrganization ? t('subtitleOrganization') : t('subtitleNation')}
          </span>
        </div>
        <p className={styles.empty}>{isOrganization ? t('emptyOrganization') : t('emptyNation')}</p>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{isOrganization ? t('organization') : t('nation')}</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {isOrganization ? t('subtitleOrganization') : t('subtitleNation')}
        </span>
      </div>
      <div className="space-y-6">
        {items.map((country, i) => (
          <LocalizedLink key={country._id} href={`/countries/${country.slug.current}`} className={styles.card}>
            <div className={styles.cardInner}>
              <div className={styles.cardBg}>
                <Image
                  src={country.mapImage ?? placeholders.country}
                  alt={country.name}
                  width={1400}
                  height={900}
                  className={styles.cardImage}
                  sizes="(max-width: 1024px) 100vw, 1200px"
                />
              </div>
              <div className={styles.cardOverlay} />
              <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.cardContent}>
                <h2 className={styles.cardName}>{country.name}</h2>
                {country.summary ? <p className={styles.cardSummary}>{country.summary}</p> : null}
                <div className={styles.cardFooter}>
                  <span className={styles.cardCta}>
                    {isOrganization ? t('ctaOrganization') : t('ctaNation')}
                  </span>
                </div>
              </div>
            </div>
          </LocalizedLink>
        ))}
      </div>
    </section>
  )
}

export function CountriesFilterSection({
  countries,
  initialFilter,
}: {
  countries: Country[]
  initialFilter: CountryFilter
}) {
  const t = useTranslations('CountriesFilter')
  const [currentFilter, setCurrentFilter] = useState<CountryFilter>(initialFilter)

  const nations = useMemo(
    () => countries.filter((item) => (item.kind ?? 'nation') !== 'organization'),
    [countries]
  )
  const organizations = useMemo(
    () => countries.filter((item) => (item.kind ?? 'nation') === 'organization'),
    [countries]
  )
  const sections: Array<{ key: CountryKind; items: Country[] }> =
    currentFilter === 'all'
      ? [
          { key: 'nation', items: nations },
          { key: 'organization', items: organizations },
        ]
      : [
          {
            key: currentFilter,
            items: currentFilter === 'organization' ? organizations : nations,
          },
        ]

  return (
    <div className="space-y-10">
      <nav className="flex flex-wrap items-center gap-2" aria-label={t('navAria')}>
        <button
          type="button"
          aria-pressed={currentFilter === 'all'}
          onClick={() => setCurrentFilter('all')}
          className={filterButtonClass(currentFilter === 'all')}
        >
          {t('all')}
        </button>
        <button
          type="button"
          aria-pressed={currentFilter === 'nation'}
          onClick={() => setCurrentFilter('nation')}
          className={filterButtonClass(currentFilter === 'nation')}
        >
          {t('nation')}
        </button>
        <button
          type="button"
          aria-pressed={currentFilter === 'organization'}
          onClick={() => setCurrentFilter('organization')}
          className={filterButtonClass(currentFilter === 'organization')}
        >
          {t('organization')}
        </button>
      </nav>
      <div className="space-y-14">
        {sections.map((section) => (
          <div key={section.key}>{renderCountrySection(section.key, section.items, t)}</div>
        ))}
      </div>
    </div>
  )
}
