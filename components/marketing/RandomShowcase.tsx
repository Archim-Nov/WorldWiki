'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { RecommendationItem } from '@/lib/recommendations'

function shuffle<T>(items: T[]): T[] {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function pickRandom(items: RecommendationItem[], count: number) {
  return shuffle(items).slice(0, count)
}

type Props = {
  items: RecommendationItem[]
}

export function RandomShowcase({ items }: Props) {
  const [displayed, setDisplayed] = useState<RecommendationItem[]>(() =>
    items.slice(0, 5)
  )
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    setDisplayed(pickRandom(items, 5))
  }, [items])

  const handleShuffle = useCallback(() => {
    if (spinning) return
    setSpinning(true)
    setTimeout(() => {
      setDisplayed(pickRandom(items, 5))
      setSpinning(false)
    }, 500)
  }, [items, spinning])

  const big = displayed[0]
  const smalls = displayed.slice(1, 5)

  return (
    <section className="mt-16 sm:mt-20">
      <div className="relative text-center mb-10">
        <span
          className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          Random Details
        </span>
        <h2 className="text-2xl font-semibold mt-2">随机展柜</h2>
        <button
          onClick={handleShuffle}
          aria-label="随机刷新"
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={spinning ? 'showcase-spin' : ''}
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
          </svg>
        </button>
      </div>

      {displayed.length > 0 ? (
        <div className="grid gap-3" style={{ gridTemplateRows: '1fr 1fr', gridTemplateColumns: '3fr 2fr 2fr', aspectRatio: '2 / 1' }}>
          {big && (
            <ShowcaseCard card={big} className="row-span-2 h-full" tall />
          )}
          {smalls.map((card) => (
            <ShowcaseCard key={card._id} card={card} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">暂无内容可展示。</p>
      )}
    </section>
  )
}

function ShowcaseCard({
  card,
  tall,
  className,
}: {
  card: RecommendationItem
  tall?: boolean
  className?: string
}) {
  return (
    <Link
      href={card.href}
      className={`group relative overflow-hidden border border-border/30 ${tall ? 'rounded-2xl' : 'rounded-lg'} ${className ?? ''}`}
    >
      <div className={tall ? 'h-full' : 'h-full'}>
        <img
          src={card.image}
          alt={card.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className={`absolute text-white ${tall ? 'bottom-5 left-5 right-5' : 'bottom-4 left-4 right-4'}`}>
        <div
          className={`uppercase tracking-[0.3em] text-white/60 ${tall ? 'text-sm' : 'text-xs'}`}
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          {card.typeLabel}
        </div>
        <h3
          className={`font-semibold ${tall ? 'text-xl sm:text-2xl mt-1.5' : 'text-base sm:text-lg mt-1'}`}
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          {card.title}
        </h3>
      </div>
    </Link>
  )
}
