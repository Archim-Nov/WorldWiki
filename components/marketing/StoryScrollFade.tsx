'use client'

import { useEffect } from 'react'

export function StoryScrollFade() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.story-detail')
    if (!root) return

    let raf = 0

    const update = () => {
      const scrollY = window.scrollY
      const vh = window.innerHeight || 1
      const fadeStart = vh * 0.1
      const fadeEnd = vh * 0.6
      const raw = (scrollY - fadeStart) / (fadeEnd - fadeStart)
      const fade = Math.max(0, Math.min(1, raw))

      root.style.setProperty('--story-fade', fade.toFixed(3))
      raf = 0
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
