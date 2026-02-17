import Link from "next/link"
import { client } from "@/lib/sanity/client"
import { globalSearchQuery } from "@/lib/sanity/queries"
import {
  buildSearchTerm,
  normalizeSearchKeyword,
  toSearchItem,
  type SearchItem,
  type SearchSource,
} from "@/lib/search"

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q
  const keyword = normalizeSearchKeyword(rawQuery)

  let items: SearchItem[] = []
  if (keyword) {
    const sources = await client.fetch<SearchSource[]>(globalSearchQuery, {
      term: buildSearchTerm(keyword),
      limit: 24,
    })
    items = sources
      .map(toSearchItem)
      .filter((item): item is SearchItem => Boolean(item))
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <header className="max-w-2xl mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Search
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold">搜索结果</h1>
        <p className="mt-3 text-muted-foreground">
          {keyword
            ? `“${keyword}” 共找到 ${items.length} 条结果`
            : "请输入关键词开始搜索"}
        </p>
      </header>

      {!keyword ? (
        <div className="rounded-2xl border bg-card p-6 text-muted-foreground">
          你可以搜索英雄、区域、国家、生物、魔法或故事。
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-muted-foreground">
          没有匹配结果，请尝试更短或更通用的关键词。
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            return (
              <Link
                key={item._id}
                href={item.href}
                className="group rounded-2xl border bg-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[16/10] bg-muted">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {item.typeLabel}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
