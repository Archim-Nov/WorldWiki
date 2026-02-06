'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { placeholders } from '@/lib/placeholders'

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
              className="group rounded-xl border bg-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-square bg-muted">
                <img
                  src={creature.portrait ?? placeholders.creature}
                  alt={creature.name}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">{creature.name}</h2>
                  {creature.species ? (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {creature.species}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {creature.category ? (
                    <span className="rounded-full border px-2 py-1">
                      {labelForCategory(creature.category)}
                    </span>
                  ) : null}
                  {creature.species ? (
                    <span className="rounded-full border px-2 py-1">
                      {creature.species}
                    </span>
                  ) : null}
                </div>
                {creature.region?.name ? (
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-3">
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
