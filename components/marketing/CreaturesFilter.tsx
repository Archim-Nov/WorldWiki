'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { placeholders } from '@/lib/placeholders'
import { LocalizedLink } from '@/components/i18n/LocalizedLink'
import styles from '@/app/(marketing)/creatures/page.module.css'

type CreatureCard = {
  _id: string
  name: string
  slug: { current: string }
  species?: string
  portrait?: string
  category?: string
  region?: { name: string; slug: { current: string } }
}

const supportedCategories = ['animal', 'plant', 'element'] as const

type SupportedCategory = (typeof supportedCategories)[number]

function isSupportedCategory(value: string): value is SupportedCategory {
  return supportedCategories.includes(value as SupportedCategory)
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

export function CreaturesFilter({ creatures }: { creatures: CreatureCard[] }) {
  const t = useTranslations('CreaturesFilter')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const labelForCategory = (value: string) => {
    if (isSupportedCategory(value)) {
      return t(`categories.${value}`)
    }
    return value
  }

  const categories = useMemo(() => {
    const baseCategories = [...supportedCategories]
    const dataCategories = creatures.map((creature) => creature.category ?? '')
    return uniqueSorted([...baseCategories, ...dataCategories])
  }, [creatures])

  const filteredCreatures = useMemo(
    () =>
      creatures.filter((creature) => {
        if (selectedCategory && creature.category !== selectedCategory) {
          return false
        }
        return true
      }),
    [creatures, selectedCategory]
  )

  const hasFilters = Boolean(selectedCategory)

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('filters')}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('showing', { current: filteredCreatures.length, total: creatures.length })}
            </p>
          </div>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-xs uppercase tracking-[0.2em] text-primary"
            >
              {t('clearFilters')}
            </button>
          ) : null}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('category')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selectedCategory === null
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:border-primary'
              }`}
            >
              {t('all')}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory((current) => (current === category ? null : category))
                }
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selectedCategory === category
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:border-primary'
                }`}
              >
                {labelForCategory(category)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filteredCreatures.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          <p>{t('empty')}</p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="mt-4 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary transition hover:border-primary"
            >
              {t('resetFilters')}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCreatures.map((creature) => (
            <LocalizedLink
              key={creature._id}
              href={`/creatures/${creature.slug.current}`}
              className={`group ${styles.card}`}
            >
              <div className={`aspect-square ${styles.cardMedia}`}>
                <Image
                  src={creature.portrait ?? placeholders.creature}
                  alt={creature.name}
                  width={900}
                  height={900}
                  className={styles.cardImage}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardName}>{creature.name}</h2>
                  {creature.species ? <span className={styles.cardSpecies}>{creature.species}</span> : null}
                </div>
                <div className={styles.cardTags}>
                  {creature.category ? (
                    <span className={styles.cardTag}>{labelForCategory(creature.category)}</span>
                  ) : null}
                  {creature.species ? <span className={styles.cardTag}>{creature.species}</span> : null}
                </div>
                {creature.region?.name ? <p className={styles.cardRegion}>{creature.region.name}</p> : null}
              </div>
            </LocalizedLink>
          ))}
        </div>
      )}
    </div>
  )
}
