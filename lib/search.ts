import { placeholders } from "@/lib/placeholders"

export type SearchDocType =
  | "hero"
  | "region"
  | "country"
  | "creature"
  | "story"
  | "magic"

export type SearchSource = {
  _id?: string
  _type?: string
  slug?: { current?: string }
  name?: string
  title?: string
  summary?: string
  species?: string
  category?: string
  kind?: string
  element?: string
  school?: string
  portrait?: string
  mapImage?: string
  coverImage?: string
}

export type SearchItem = {
  _id: string
  type: SearchDocType
  typeLabel: string
  href: string
  title: string
  description: string
  image: string
}

const typeMeta: Record<
  SearchDocType,
  { label: string; route: string; placeholder: string }
> = {
  hero: { label: "英雄", route: "champions", placeholder: placeholders.hero },
  region: { label: "区域", route: "regions", placeholder: placeholders.region },
  country: {
    label: "国家",
    route: "countries",
    placeholder: placeholders.country,
  },
  creature: {
    label: "生物",
    route: "creatures",
    placeholder: placeholders.creature,
  },
  story: { label: "故事", route: "stories", placeholder: placeholders.story },
  magic: { label: "魔法", route: "magics", placeholder: placeholders.magic },
}

export function normalizeSearchKeyword(raw: string | undefined) {
  return (raw ?? "").trim().replace(/\s+/g, " ")
}

export function buildSearchTerm(keyword: string) {
  if (!keyword) {
    return ""
  }
  return `*${keyword.replace(/\s+/g, "*")}*`
}

function isSearchDocType(value: string): value is SearchDocType {
  return value in typeMeta
}

function kindLabel(type: SearchDocType, kind?: string) {
  if (!kind) {
    return null
  }
  if (type === "country") {
    return kind === "organization" ? "组织" : kind === "nation" ? "国家" : kind
  }
  if (type === "magic") {
    return kind === "principle" ? "原理" : kind === "spell" ? "法术" : kind
  }
  return kind
}

function elementLabel(element?: string) {
  if (!element) {
    return null
  }
  if (element === "fire") return "火"
  if (element === "wind") return "风"
  if (element === "earth") return "土"
  if (element === "water") return "水"
  return element
}

function magicDescription(source: SearchSource) {
  const kind = kindLabel("magic", source.kind)
  const element = elementLabel(source.element)

  if (source.kind === "spell" && kind && element) {
    return `${kind} · ${element}`
  }
  return kind ?? element
}

export function toSearchItem(source: SearchSource): SearchItem | null {
  if (!source._id || !source._type || !source.slug?.current) {
    return null
  }
  if (!isSearchDocType(source._type)) {
    return null
  }
  const type = source._type
  const meta = typeMeta[type]
  const title = source.name ?? source.title
  if (!title) {
    return null
  }

  const description =
    source.summary ??
    source.species ??
    source.category ??
    (type === "magic" ? magicDescription(source) : kindLabel(type, source.kind)) ??
    source.school ??
    `查看${meta.label}详情`

  let image = meta.placeholder
  if (type === "hero" || type === "creature") {
    image = source.portrait ?? image
  } else if (type === "region" || type === "country") {
    image = source.mapImage ?? image
  } else if (type === "story" || type === "magic") {
    image = source.coverImage ?? image
  }

  return {
    _id: source._id,
    type,
    typeLabel: meta.label,
    href: `/${meta.route}/${source.slug.current}`,
    title,
    description,
    image,
  }
}
