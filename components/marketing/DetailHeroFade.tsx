'use client'

import { useEffect } from 'react'

interface DetailHeroFadeProps {
  rootSelector: string
  bodySelector: string
  cssVar: string
}

export function DetailHeroFade({
  rootSelector,
  bodySelector,
  cssVar,
}: DetailHeroFadeProps) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(rootSelector)
    const body = document.querySelector<HTMLElement>(bodySelector)
    if (!root || !body) return

    const findScrollParent = (node: HTMLElement | null) => {
      let current: HTMLElement | null = node
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current)
        if (/(auto|scroll)/.test(style.overflowY)) return current
        current = current.parentElement
      }
      return null
    }

    const scrollParent = findScrollParent(body)
    const scrollTarget: Window | HTMLElement = scrollParent ?? window

    let raf = 0

    const update = () => {
      const rect = body.getBoundingClientRect()
      const viewportHeight =
        scrollTarget === window
          ? window.innerHeight || 1
          : (scrollTarget as HTMLElement).clientHeight || 1
      const containerTop =
        scrollTarget === window
          ? 0
          : (scrollTarget as HTMLElement).getBoundingClientRect().top
      const relativeTop = rect.top - containerTop

      const start = viewportHeight * 0.85
      const end = viewportHeight * 0.25
      const raw = (start - relativeTop) / (start - end)
      const clamped = Math.max(0, Math.min(1, raw))

      root.style.setProperty(cssVar, clamped.toFixed(3))
      raf = 0
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    update()
    scrollTarget.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      scrollTarget.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [rootSelector, bodySelector, cssVar])

  return null
}
