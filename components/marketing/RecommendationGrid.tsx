import Link from 'next/link'
import Image from 'next/image'

type RecommendationItem = {
  _id: string
  title: string
  href: string
  image: string
  typeLabel: string
}

export function RecommendationGrid({
  title = '相关推荐',
  subtitle = 'Related Picks',
  items,
}: {
  title?: string
  subtitle?: string
  items: RecommendationItem[]
}) {
  const displayItems = items.slice(0, 3)

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {subtitle}
        </span>
      </div>
      {displayItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          {displayItems.map((item) => (
            <Link
              key={item._id}
              href={item.href}
              className="group rounded-2xl border bg-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={960}
                  height={720}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                  {item.typeLabel}
                </div>
                <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">暂无相关推荐内容。</p>
      )}
    </section>
  )
}
