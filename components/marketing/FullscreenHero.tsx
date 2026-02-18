'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeroFade } from './HeroFade'

type HeroItem = {
  _id: string
  title: string
  href: string
  image: string
  typeLabel: string
}

export function FullscreenHero({ items }: { items: HeroItem[] }) {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const total = items.length

  const goNext = useCallback(() => {
    setDirection('next')
    setActive((i) => (i + 1) % total)
  }, [total])

  const goPrev = useCallback(() => {
    setDirection('prev')
    setActive((i) => (i - 1 + total) % total)
  }, [total])

  const goTo = useCallback(
    (index: number) => {
      if (index === active) return
      setDirection(index > active ? 'next' : 'prev')
      setActive(index)
    },
    [active],
  )

  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(goNext, 6000)
    return () => clearInterval(timer)
  }, [total, goNext])

  if (total === 0) return null

  const current = items[active]

  return (
    <section className="hero-fs">
      <HeroFade />
      <div className="hero-fs-stage">
        {items.map((item, i) => (
          <div
            key={item._id}
            className={`hero-fs-slide ${
              i === active
                ? 'hero-fs-slide--active'
                : direction === 'next'
                  ? 'hero-fs-slide--exit'
                  : 'hero-fs-slide--exit-prev'
            }`}
          >
            <Image
              src={item.image}
              alt={item.title}
              width={1920}
              height={1080}
              className="hero-fs-image"
              sizes="100vw"
              priority={i === active}
              draggable={false}
            />
          </div>
        ))}

        <div className="hero-fs-welcome" aria-hidden="true">
          <div className="hero-fs-welcome-lockup">
            <p className="hero-fs-welcome-kicker">Museum Universe Archive</p>
            <p
              className="hero-fs-welcome-title"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              WorldWiki
            </p>
            <p className="hero-fs-welcome-subtitle">
              一个以详情为入口的世界观档案馆
            </p>
          </div>
        </div>

        <div className="hero-fs-overlay" />
        <div className="hero-fs-vignette" />

        {/* Bottom bar — inside stage for absolute positioning */}
        <div className="hero-fs-bottom">
          <div className="hero-fs-content">
            <div className="hero-fs-meta">
              <span className="hero-fs-tag">{current.typeLabel}</span>
              <h1 className="hero-fs-title" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                <Link href={current.href} className="hero-fs-title-link">
                  {current.title}
                </Link>
              </h1>
            </div>

            <div className="hero-fs-scroll">
              <span>Scroll</span>
              <div className="hero-fs-scroll-track">
                <div className="hero-fs-scroll-thumb" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav — outside Link to avoid nested interactive elements */}
      {total > 1 ? (
        <div className="hero-fs-nav">
          <button type="button" onClick={goPrev} className="hero-fs-arrow" aria-label="Previous">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="hero-fs-dots">
            {items.map((item, i) => (
              <button
                key={item._id}
                type="button"
                onClick={() => goTo(i)}
                className={`hero-fs-dot ${i === active ? 'hero-fs-dot--active' : ''}`}
                aria-label={`Go to ${item.title}`}
              />
            ))}
          </div>
          <button type="button" onClick={goNext} className="hero-fs-arrow" aria-label="Next">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ) : null}
    </section>
  )
}
