'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { placeholders } from '@/lib/placeholders'
import { LocalizedLink } from '@/components/i18n/LocalizedLink'
import styles from './page.module.css'

type MagicKind = 'principle' | 'spell'
type MagicFilter = 'all' | MagicKind
type MagicElement = 'fire' | 'wind' | 'earth' | 'water'
type SpellElementFilter = 'all' | MagicElement

type Magic = {
  _id: string
  name: string
  slug: { current: string }
  kind?: MagicKind
  element?: MagicElement
  school?: string
  summary?: string
  coverImage?: string
}

function filterButtonClass(active: boolean) {
  return [
    'inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-sm transition',
    active
      ? 'border-primary bg-primary text-primary-foreground'
      : 'border-border bg-background/70 text-foreground hover:bg-accent',
  ].join(' ')
}

function elementFilterButtonClass(active: boolean) {
  return [
    'rounded-full border px-3 py-1 text-xs transition',
    active
      ? 'border-primary bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:border-primary',
  ].join(' ')
}

function renderMagicSection(kind: MagicKind, items: Magic[], t: ReturnType<typeof useTranslations>) {
  const isPrinciple = kind === 'principle'

  if (items.length === 0) {
    return (
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={styles.sectionTitle}>
            {isPrinciple ? t('principle') : t('spell')}
          </h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {isPrinciple ? t('subtitlePrinciple') : t('subtitleSpell')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {isPrinciple ? t('emptyPrinciple') : t('emptySpell')}
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className={styles.sectionTitle}>{isPrinciple ? t('principle') : t('spell')}</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {isPrinciple ? t('subtitlePrinciple') : t('subtitleSpell')}
        </span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((magic) => (
          <LocalizedLink key={magic._id} href={`/magics/${magic.slug.current}`} className={`group ${styles.card}`}>
            <div className={`aspect-[16/10] ${styles.cardMedia}`}>
              <Image
                src={magic.coverImage ?? placeholders.magic}
                alt={magic.name}
                width={1280}
                height={800}
                className={styles.cardImage}
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardMeta}>
                {magic.school ? <span>{magic.school}</span> : null}
                {magic.kind === 'spell' && magic.element ? (
                  <span className={styles.spellBadge}>{t(`elements.${magic.element}`)}</span>
                ) : null}
              </div>
              <h2 className={styles.cardName}>{magic.name}</h2>
              <p className={`line-clamp-2 ${styles.cardSummary}`}>
                {magic.summary ?? t('summaryFallback')}
              </p>
            </div>
          </LocalizedLink>
        ))}
      </div>
    </section>
  )
}

export function MagicsFilterSection({
  magics,
  initialFilter,
}: {
  magics: Magic[]
  initialFilter: MagicFilter
}) {
  const t = useTranslations('MagicsFilter')
  const [currentFilter, setCurrentFilter] = useState<MagicFilter>(initialFilter)
  const [spellElementFilter, setSpellElementFilter] = useState<SpellElementFilter>('all')

  const principles = useMemo(
    () => magics.filter((item) => (item.kind ?? 'spell') === 'principle'),
    [magics]
  )
  const spells = useMemo(
    () => magics.filter((item) => (item.kind ?? 'spell') !== 'principle'),
    [magics]
  )
  const filteredSpells = useMemo(
    () =>
      spells.filter((item) => {
        if (spellElementFilter === 'all') {
          return true
        }
        return item.element === spellElementFilter
      }),
    [spells, spellElementFilter]
  )

  const sections: Array<{ key: MagicKind; items: Magic[] }> =
    currentFilter === 'all'
      ? [
          { key: 'principle', items: principles },
          { key: 'spell', items: spells },
        ]
      : [
          {
            key: currentFilter,
            items: currentFilter === 'principle' ? principles : filteredSpells,
          },
        ]

  const hasSpellElementFilter = spellElementFilter !== 'all'

  return (
    <div className="space-y-10">
      <nav className="flex flex-wrap items-center gap-2" aria-label={t('switchAria')}>
        <button
          type="button"
          aria-pressed={currentFilter === 'all'}
          onClick={() => {
            setCurrentFilter('all')
            setSpellElementFilter('all')
          }}
          className={filterButtonClass(currentFilter === 'all')}
        >
          {t('all')}
        </button>
        <button
          type="button"
          aria-pressed={currentFilter === 'principle'}
          onClick={() => setCurrentFilter('principle')}
          className={filterButtonClass(currentFilter === 'principle')}
        >
          {t('principle')}
        </button>
        <button
          type="button"
          aria-pressed={currentFilter === 'spell'}
          onClick={() => setCurrentFilter('spell')}
          className={filterButtonClass(currentFilter === 'spell')}
        >
          {t('spell')}
        </button>
      </nav>

      {currentFilter === 'spell' ? (
        <section className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('filters')}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('showing', { current: filteredSpells.length, total: spells.length })}
              </p>
            </div>
            {hasSpellElementFilter ? (
              <button
                type="button"
                onClick={() => setSpellElementFilter('all')}
                className="text-xs uppercase tracking-[0.2em] text-primary"
              >
                {t('clearFilters')}
              </button>
            ) : null}
          </div>

          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('elementFilter')}</p>
          <div className="flex flex-wrap gap-2" aria-label={t('elementFilterAria')}>
            <button
              type="button"
              aria-pressed={spellElementFilter === 'all'}
              data-element-filter="all"
              onClick={() => setSpellElementFilter('all')}
              className={elementFilterButtonClass(spellElementFilter === 'all')}
            >
              {t('all')}
            </button>
            {(['fire', 'wind', 'earth', 'water'] as const).map((element) => (
              <button
                key={element}
                type="button"
                aria-pressed={spellElementFilter === element}
                data-element-filter={element}
                onClick={() => setSpellElementFilter(element)}
                className={elementFilterButtonClass(spellElementFilter === element)}
              >
                {t(`elements.${element}`)}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="space-y-14">
        {sections.map((section) => (
          <div key={section.key}>{renderMagicSection(section.key, section.items, t)}</div>
        ))}
      </div>
    </div>
  )
}
