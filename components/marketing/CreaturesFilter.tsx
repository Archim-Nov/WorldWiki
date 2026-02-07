'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { placeholders } from '@/lib/placeholders'
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

const categoryLabels: Record<string, string> = {
  animal: '动物',
  plant: '植物',
  element: '元素',
}

function labelForCategory(value: string) {
  return categoryLabels[value] ?? value
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    labelForCategory(a).localeCompare(labelForCategory(b))
  )
}

export function CreaturesFilter({ creatures }: { creatures: CreatureCard[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const baseCategories = ['animal', 'plant', 'element']
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
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Filters
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {filteredCreatures.length} of {creatures.length}
            </p>
          </div>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-xs uppercase tracking-[0.2em] text-primary"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Category
          </p>
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
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory((current) =>
                    current === category ? null : category
                  )
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
          <p>当前筛选没有匹配结果。</p>
          <p className="mt-2">No creatures match the selected filters.</p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="mt-4 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary transition hover:border-primary"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCreatures.map((creature) => (
            <Link
              key={creature._id}
              href={`/creatures/${creature.slug.current}`}
              className={`group ${styles.card}`}
            >
              <div className={`aspect-square ${styles.cardMedia}`}>
                <img
                  src={creature.portrait ?? placeholders.creature}
                  alt={creature.name}
                  className={styles.cardImage}
                  loading="lazy"
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardName}>{creature.name}</h2>
                  {creature.species ? (
                    <span className={styles.cardSpecies}>
                      {creature.species}
                    </span>
                  ) : null}
                </div>
                <div className={styles.cardTags}>
                  {creature.category ? (
                    <span className={styles.cardTag}>
                      {labelForCategory(creature.category)}
                    </span>
                  ) : null}
                  {creature.species ? (
                    <span className={styles.cardTag}>
                      {creature.species}
                    </span>
                  ) : null}
                </div>
                {creature.region?.name ? (
                  <p className={styles.cardRegion}>
                    {creature.region.name}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
