'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'

type CarouselItem = {
  _id: string
  title: string
  href: string
  image: string
  typeLabel?: string
}

function clampSize(items: CarouselItem[], max: number) {
  return items.slice(0, max)
}

export function CenteredCarousel({
  items,
  className,
}: {
  items: CarouselItem[]
  className?: string
}) {
  const displayItems = useMemo(() => clampSize(items, 5), [items])
  const [position, setPosition] = useState(0)
  const [isSnapping, setIsSnapping] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState({ container: 0, card: 0 })
  const total = displayItems.length
  const showSides = total > 1

  useEffect(() => {
    if (total === 0) {
      setPosition(0)
      return
    }
    if (total === 1) {
      setPosition(0)
      return
    }
    setPosition(total * 2)
  }, [total])

  useEffect(() => {
    if (!isSnapping) {
      return
    }
    const id = requestAnimationFrame(() => setIsSnapping(false))
    return () => cancelAnimationFrame(id)
  }, [isSnapping])

  useEffect(() => {
    const node = viewportRef.current
    if (!node) {
      return
    }
    const update = () => {
      const width = node.clientWidth
      const ratio = showSides ? 0.76 : 1
      setMetrics({
        container: width,
        card: Math.round(width * ratio),
      })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [showSides])

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">暂无内容。</p>
    )
  }

  const activeIndex = total > 0 ? ((position % total) + total) % total : 0

  const goPrev = () => {
    if (!showSides) {
      return
    }
    setPosition((current) => current - 1)
  }

  const goNext = () => {
    if (!showSides) {
      return
    }
    setPosition((current) => current + 1)
  }

  const goTo = (dotIndex: number) => {
    if (dotIndex === activeIndex) {
      return
    }
    if (!showSides) {
      return
    }
    const forward = (dotIndex - activeIndex + total) % total
    const backward = (activeIndex - dotIndex + total) % total
    if (forward <= backward) {
      setPosition((current) => current + forward)
    } else {
      setPosition((current) => current - backward)
    }
  }

  const trackItems = useMemo(() => {
    if (total <= 1) {
      return displayItems.map((item, itemIndex) => ({
        key: item._id,
        item,
        itemIndex,
      }))
    }
    const copies = 5
    return Array.from({ length: copies })
      .flatMap(() => displayItems)
      .map((item, trackIndex) => ({
        key: `${item._id}-${trackIndex}`,
        item,
        itemIndex: trackIndex % total,
      }))
  }, [displayItems, total])

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (event.target !== event.currentTarget) {
      return
    }
    if (event.propertyName !== 'transform') {
      return
    }
    if (!showSides) {
      return
    }
    if (position <= total - 1) {
      setIsSnapping(true)
      setPosition((current) => current + total * 2)
      return
    }
    if (position >= total * 4) {
      setIsSnapping(true)
      setPosition((current) => current - total * 2)
    }
  }

  const handleCardClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    trackIndex: number
  ) => {
    if (!showSides) {
      return
    }
    if (trackIndex === position) {
      return
    }
    event.preventDefault()
    if (trackIndex === position - 1) {
      goPrev()
      return
    }
    if (trackIndex === position + 1) {
      goNext()
      return
    }
    const diff = trackIndex - position
    if (diff > 0) {
      setPosition((current) => current + 1)
    } else if (diff < 0) {
      setPosition((current) => current - 1)
    }
  }

  const cardLabel = (item: CarouselItem) =>
    item.typeLabel ? (
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {item.typeLabel}
      </div>
    ) : null

  const gap = 50
  const translate =
    metrics.card > 0
      ? (metrics.container - metrics.card) / 2 -
        position * (metrics.card + gap)
      : 0

  const trackStyle: CSSProperties = {
    transform: `translateX(${translate}px)`,
    '--carousel-card-width': metrics.card ? `${metrics.card}px` : '100%',
    '--carousel-gap': `${gap}px`,
  } as CSSProperties

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <div ref={viewportRef} className="relative overflow-x-clip">
        <div
          className={`home-carousel-track flex items-stretch ${
            isSnapping ? 'home-carousel-track-snap' : ''
          }`}
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {trackItems.map((entry, trackIndex) => (
            <Link
              key={entry.key}
              href={entry.item.href}
              data-active={entry.itemIndex === activeIndex}
              onClick={(event) => handleCardClick(event, trackIndex)}
              className="home-carousel-card group rounded-3xl border border-border/30 bg-card overflow-hidden"
            >
              <div className="h-[340px] sm:h-[440px] lg:h-[540px] bg-muted">
                <img
                  src={entry.item.image}
                  alt={entry.item.title}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="p-5 sm:p-6">
                {cardLabel(entry.item)}
                <h3 className="text-2xl font-semibold mt-2">
                  {entry.item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {showSides ? (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full border px-3 py-1 text-sm transition hover:border-primary"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            {displayItems.map((item, dotIndex) => (
              <button
                key={item._id}
                type="button"
                onClick={() => goTo(dotIndex)}
                className={`h-2 w-2 rounded-full transition ${
                  dotIndex === activeIndex
                    ? 'bg-primary'
                    : 'bg-muted-foreground/40'
                }`}
                aria-label={`Go to ${item.title}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full border px-3 py-1 text-sm transition hover:border-primary"
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  )
}
