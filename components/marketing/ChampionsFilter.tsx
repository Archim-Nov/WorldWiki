'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { placeholders } from '@/lib/placeholders'
import { LocalizedLink } from '@/components/i18n/LocalizedLink'
import styles from '@/app/(marketing)/champions/page.module.css'

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
  return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label))
}

export function ChampionsFilter({ heroes }: { heroes: HeroCard[] }) {
  const t = useTranslations('ChampionsFilter')
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
        if (selectedCountry && hero.country?.slug.current !== selectedCountry) {
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
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('filters')}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('showing', { current: filteredHeroes.length, total: heroes.length })}
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
              {t('clearFilters')}
            </button>
          ) : null}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('country')}</p>
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
                {t('all')}
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
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('region')}</p>
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
                {t('all')}
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
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{t('empty')}</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredHeroes.map((hero) => (
            <LocalizedLink
              key={hero._id}
              href={`/champions/${hero.slug.current}`}
              className={`group ${styles.card}`}
            >
              <div className={`aspect-[3/4] ${styles.cardMedia}`}>
                <Image
                  src={hero.portrait ?? placeholders.hero}
                  alt={hero.name}
                  width={900}
                  height={1200}
                  className={styles.cardImage}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className={styles.cardOverlay} />
              <div className={styles.cardContent}>
                <h2 className={styles.cardName}>{hero.name}</h2>
                {hero.title ? <p className={styles.cardTitle}>{hero.title}</p> : null}
                <div className={styles.cardTags}>
                  {hero.faction ? <span className={styles.cardTag}>{hero.faction}</span> : null}
                  {hero.roles && hero.roles.length > 0 ? (
                    <span className={styles.cardTag}>{hero.roles[0]}</span>
                  ) : null}
                </div>
              </div>
            </LocalizedLink>
          ))}
        </div>
      )}
    </div>
  )
}
