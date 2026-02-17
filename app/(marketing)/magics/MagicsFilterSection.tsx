'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { placeholders } from '@/lib/placeholders'
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

function sectionTitle(kind: MagicKind) {
  return kind === 'principle' ? '原理' : '法术'
}

function sectionSubtitle(kind: MagicKind) {
  return kind === 'principle' ? 'Principles' : 'Spells'
}

function elementLabel(element?: MagicElement) {
  if (element === 'fire') return '火'
  if (element === 'wind') return '风'
  if (element === 'earth') return '土'
  if (element === 'water') return '水'
  return null
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

function renderMagicSection(kind: MagicKind, items: Magic[]) {
  if (items.length === 0) {
    return (
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={styles.sectionTitle}>{sectionTitle(kind)}</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {sectionSubtitle(kind)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {kind === 'principle' ? '暂无原理内容。' : '暂无法术内容。'}
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className={styles.sectionTitle}>{sectionTitle(kind)}</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {sectionSubtitle(kind)}
        </span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((magic) => (
          <Link
            key={magic._id}
            href={`/magics/${magic.slug.current}`}
            className={`group ${styles.card}`}
          >
            <div className={`aspect-[16/10] ${styles.cardMedia}`}>
              <img
                src={magic.coverImage ?? placeholders.magic}
                alt={magic.name}
                className={styles.cardImage}
                loading="lazy"
              />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardMeta}>
                {magic.school ? <span>{magic.school}</span> : null}
                {magic.kind === 'spell' && magic.element ? (
                  <span className={styles.spellBadge}>{elementLabel(magic.element)}</span>
                ) : null}
              </div>
              <h2 className={styles.cardName}>{magic.name}</h2>
              <p className={`line-clamp-2 ${styles.cardSummary}`}>
                {magic.summary ?? '查看这条魔法的完整设定与关联内容。'}
              </p>
            </div>
          </Link>
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
  const [currentFilter, setCurrentFilter] = useState<MagicFilter>(initialFilter)
  const [spellElementFilter, setSpellElementFilter] =
    useState<SpellElementFilter>('all')

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
      <nav className="flex flex-wrap items-center gap-2" aria-label="原理和法术切换">
        <button
          type="button"
          aria-pressed={currentFilter === 'all'}
          onClick={() => {
            setCurrentFilter('all')
            setSpellElementFilter('all')
          }}
          className={filterButtonClass(currentFilter === 'all')}
        >
          全部
        </button>
        <button
          type="button"
          aria-pressed={currentFilter === 'principle'}
          onClick={() => setCurrentFilter('principle')}
          className={filterButtonClass(currentFilter === 'principle')}
        >
          原理
        </button>
        <button
          type="button"
          aria-pressed={currentFilter === 'spell'}
          onClick={() => setCurrentFilter('spell')}
          className={filterButtonClass(currentFilter === 'spell')}
        >
          法术
        </button>
      </nav>

      {currentFilter === 'spell' ? (
        <section className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Filters
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Showing {filteredSpells.length} of {spells.length}
              </p>
            </div>
            {hasSpellElementFilter ? (
              <button
                type="button"
                onClick={() => setSpellElementFilter('all')}
                className="text-xs uppercase tracking-[0.2em] text-primary"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            元素筛选
          </p>
          <div className="flex flex-wrap gap-2" aria-label="法术元素筛选">
            <button
              type="button"
              aria-pressed={spellElementFilter === 'all'}
              data-element-filter="all"
              onClick={() => setSpellElementFilter('all')}
              className={elementFilterButtonClass(spellElementFilter === 'all')}
            >
              全部
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
                {elementLabel(element)}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="space-y-14">
        {sections.map((section) => (
          <div key={section.key}>{renderMagicSection(section.key, section.items)}</div>
        ))}
      </div>
    </div>
  )
}
