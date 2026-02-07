'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type CarouselItem = {
  _id: string
  title: string
  href: string
  image: string
  typeLabel?: string
}

export function HorizontalCarousel({ items }: { items: CarouselItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 8)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8)
  }

  useEffect(() => {
    updateScrollState()
    const el = trackRef.current
    if (!el) return
    const onScroll = () => updateScrollState()
    const onResize = () => updateScrollState()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [items.length])

  const scrollByPage = (direction: number) => {
    const el = trackRef.current
    if (!el) return
    const amount = el.clientWidth * direction
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {items.map((item) => (
          <Link
            key={item._id}
            href={item.href}
            className="group min-w-[220px] sm:min-w-[260px] rounded-2xl border bg-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="h-[140px] sm:h-[160px] bg-muted">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              {item.typeLabel ? (
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {item.typeLabel}
                </div>
              ) : null}
              <h4 className="text-lg font-semibold mt-2">{item.title}</h4>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={!canScrollLeft}
        className={`absolute -left-3 top-1/2 -translate-y-1/2 rounded-full border bg-background/90 px-3 py-2 text-sm transition ${
          canScrollLeft ? 'hover:border-primary' : 'opacity-40'
        }`}
        aria-label="Scroll left"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={!canScrollRight}
        className={`absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border bg-background/90 px-3 py-2 text-sm transition ${
          canScrollRight ? 'hover:border-primary' : 'opacity-40'
        }`}
        aria-label="Scroll right"
      >
        →
      </button>
    </div>
  )
}
