import { client } from '@/lib/sanity/client'
import { countriesQuery } from '@/lib/sanity/queries'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'
import { CountriesFilterSection } from './CountriesFilterSection'
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

function normalizeCountryFilter(raw?: string): CountryFilter {
  if (raw === 'nation' || raw === 'organization') {
    return raw
  }
  return 'all'
}

export default async function CountriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ kind?: string }>
} = {}) {
  const countries: Country[] = await client.fetch(countriesQuery)
  const resolvedSearchParams = (await searchParams) ?? {}
  const initialFilter = normalizeCountryFilter(resolvedSearchParams.kind)

  return (
    <div className={`${styles.page} container mx-auto px-4 py-12 sm:py-16`}>
      <ScrollReveal as="header" className="max-w-2xl mb-14">
        <p className={styles.eyebrow}>Countries</p>
        <h1 className={styles.title}>国家与组织</h1>
        <p className={styles.lead}>
          按政治实体与组织体系两条路径，进入世界的版块与文明。
        </p>
      </ScrollReveal>

      {countries.length === 0 ? (
        <p className={styles.empty}>
          暂无国家或组织内容，请先在 Studio 中创建。
        </p>
      ) : (
        <CountriesFilterSection countries={countries} initialFilter={initialFilter} />
      )}
    </div>
  )
}
