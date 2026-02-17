import { placeholders } from '@/lib/placeholders'

export type RecommendationType =
  | 'hero'
  | 'region'
  | 'country'
  | 'creature'
  | 'story'
  | 'magic'

export const typeLabels: Record<RecommendationType, string> = {
  hero: '英雄',
  region: '区域',
  country: '国家',
  creature: '生物',
  story: '故事',
  magic: '魔法',
}

export const typeRoutes: Record<RecommendationType, string> = {
  hero: 'champions',
  region: 'regions',
  country: 'countries',
  creature: 'creatures',
  story: 'stories',
  magic: 'magics',
}

const typePlaceholders: Record<RecommendationType, string> = {
  hero: placeholders.hero,
  region: placeholders.region,
  country: placeholders.country,
  creature: placeholders.creature,
  story: placeholders.story,
  magic: placeholders.magic,
}

export type RecommendationItem = {
  _id: string
  title: string
  href: string
  image: string
  typeLabel: string
}

export type RecommendationSource = {
  _id?: string
  _type?: RecommendationType
  slug?: { current: string }
  title?: string
  name?: string
  portrait?: string
  mapImage?: string
  coverImage?: string
}

export function toRecommendation(
  item: RecommendationSource,
  typeOverride?: RecommendationType
): RecommendationItem | null {
  const type = typeOverride ?? item._type
  if (!type) {
    return null
  }
  if (!item._id || !item.slug?.current) {
    return null
  }
  const title = item.title ?? item.name
  if (!title) {
    return null
  }

  let image = typePlaceholders[type]
  if (type === 'hero' || type === 'creature') {
    image = item.portrait ?? image
  } else if (type === 'region' || type === 'country') {
    image = item.mapImage ?? image
  } else if (type === 'story' || type === 'magic') {
    image = item.coverImage ?? image
  }

  return {
    _id: item._id,
    title,
    href: `/${typeRoutes[type]}/${item.slug.current}`,
    image,
    typeLabel: typeLabels[type],
  }
}

export function addRecommendations(
  list: RecommendationItem[],
  seen: Set<string>,
  items: RecommendationSource[],
  typeOverride?: RecommendationType,
  limit = 3
) {
  for (const item of items) {
    if (list.length >= limit) {
      return
    }
    const rec = toRecommendation(item, typeOverride)
    if (!rec) {
      continue
    }
    if (seen.has(rec._id)) {
      continue
    }
    list.push(rec)
    seen.add(rec._id)
  }
}
