'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { LocalizedLink } from '@/components/i18n/LocalizedLink'

type CarouselItem = {
  _id: string
  title: string
  href: string
  image: string
  typeLabel?: string
}

const VISIBLE = 2
const AUTO_INTERVAL = 5000

function ringOffset(from: number, to: number, len: number) {
  let d = to - from
  if (d > len / 2) d -= len
  if (d < -len / 2) d += len
  return d
}

export function CenteredCarousel({
  items,
  className,
}: {
  items: CarouselItem[]
  className?: string
}) {
  const pool = useMemo(() => items.slice(0, 5), [items])
  const total = pool.length
  const [active, setActive] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedRef = useRef(false)

  const go = useCallback(
    (dir: number) => setActive((a) => (a + dir + total) % total),
    [total],
  )

  const restartAutoScroll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (total <= 1) return

    timerRef.current = setInterval(() => {
      if (!pausedRef.current) go(1)
    }, AUTO_INTERVAL)
  }, [total, go])

  /* ── auto-scroll every 5s, pause on hover ── */
  useEffect(() => {
    restartAutoScroll()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [restartAutoScroll])

  const onMouseEnter = useCallback(() => { pausedRef.current = true }, [])
  const onMouseLeave = useCallback(() => { pausedRef.current = false }, [])

  const onCardClick = useCallback(
    (e: React.MouseEvent, idx: number) => {
      if (idx !== active) {
        e.preventDefault()
        setActive(idx)
        restartAutoScroll()
      }
    },
    [active, restartAutoScroll],
  )

  if (total === 0) return null

  return (
    <div className={`coverflow ${className ?? ''}`}>
      <div
        className="coverflow-stage"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {pool.map((item, i) => {
          const offset = ringOffset(active, i, total)
          const abs = Math.abs(offset)
          const hidden = abs > VISIBLE

          return (
            <LocalizedLink
              key={item._id}
              href={item.href}
              onClick={(e) => onCardClick(e, i)}
              className={`coverflow-card group${offset === 0 ? ' coverflow-card--center' : ''}`}
              style={
                hidden
                  ? { visibility: 'hidden', pointerEvents: 'none' }
                  : ({
                      '--cf-offset': offset,
                      '--cf-abs': abs,
                    } as React.CSSProperties)
              }
              aria-hidden={hidden}
              tabIndex={hidden ? -1 : undefined}
            >
              <div className="coverflow-card-img">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={960}
                  height={540}
                  className="h-full w-full object-cover"
                  sizes="(max-width:640px) 90vw, 560px"
                />
              </div>
              <div className="coverflow-card-body">
                {item.typeLabel && (
                  <span className="coverflow-card-tag">{item.typeLabel}</span>
                )}
                <h3 className="coverflow-card-title">{item.title}</h3>
              </div>
            </LocalizedLink>
          )
        })}
      </div>

      {total > 1 && (
        <div className="coverflow-dots">
          {pool.map((item, i) => (
            <button
              key={item._id}
              type="button"
              onClick={() => {
                setActive(i)
                restartAutoScroll()
              }}
              className={`coverflow-dot${i === active ? ' coverflow-dot--active' : ''}`}
              aria-label={`Go to ${item.title}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
