'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { placeholders } from '@/lib/placeholders'

type HeroCard = {
  _id: string
  name: string
  title?: string
  slug: { current: string }
  portrait?: string
  faction?: string
  roles?: string[]
  region?: { name: string; slug: { current: string } }
  country?: { name: string; slug: { current: string } }
}

type Option = { label: string; value: string }

function uniqueOptions(options: Option[]) {
  const unique = new Map<string, Option>()
  for (const option of options) {
    if (option.value) {
      unique.set(option.value, option)
    }
  }
  return Array.from(unique.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  )
}

export function ChampionsFilter({ heroes }: { heroes: HeroCard[] }) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const countries = useMemo(() => {
    const options = heroes
      .map((hero) => hero.country)
      .filter((country): country is NonNullable<typeof country> => Boolean(country))
      .map((country) => ({
        label: country.name,
        value: country.slug.current,
      }))
    return uniqueOptions(options)
  }, [heroes])

  const regions = useMemo(() => {
    const options = heroes
      .map((hero) => hero.region)
      .filter((region): region is NonNullable<typeof region> => Boolean(region))
      .map((region) => ({
        label: region.name,
        value: region.slug.current,
      }))
    return uniqueOptions(options)
  }, [heroes])

  const filteredHeroes = useMemo(
    () =>
      heroes.filter((hero) => {
        if (
          selectedCountry &&
          hero.country?.slug.current !== selectedCountry
        ) {
          return false
        }
        if (selectedRegion && hero.region?.slug.current !== selectedRegion) {
          return false
        }
        return true
      }),
    [heroes, selectedCountry, selectedRegion]
  )

  const hasFilters = selectedCountry || selectedRegion

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Filters
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {filteredHeroes.length} of {heroes.length}
            </p>
          </div>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setSelectedCountry(null)
                setSelectedRegion(null)
              }}
              className="text-xs uppercase tracking-[0.2em] text-primary"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Country
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selectedCountry === null
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:border-primary'
                }`}
              >
                All
              </button>
              {countries.map((country) => (
                <button
                  key={country.value}
                  type="button"
                  onClick={() =>
                    setSelectedCountry((current) =>
                      current === country.value ? null : country.value
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selectedCountry === country.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:border-primary'
                  }`}
                >
                  {country.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Region
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedRegion(null)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selectedRegion === null
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:border-primary'
                }`}
              >
                All
              </button>
              {regions.map((region) => (
                <button
                  key={region.value}
                  type="button"
                  onClick={() =>
                    setSelectedRegion((current) =>
                      current === region.value ? null : region.value
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selectedRegion === region.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:border-primary'
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {filteredHeroes.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          No champions match the selected filters. Try clearing filters to see
          everything.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredHeroes.map((hero) => (
            <Link
              key={hero._id}
              href={`/champions/${hero.slug.current}`}
              className="group rounded-2xl border bg-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[3/4] bg-muted">
                <img
                  src={hero.portrait ?? placeholders.hero}
                  alt={hero.name}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70" />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold">{hero.name}</h2>
                {hero.title ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    {hero.title}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {hero.faction ? (
                    <span className="rounded-full border px-2 py-1">
                      {hero.faction}
                    </span>
                  ) : null}
                  {hero.roles && hero.roles.length > 0 ? (
                    <span className="rounded-full border px-2 py-1">
                      {hero.roles[0]}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
