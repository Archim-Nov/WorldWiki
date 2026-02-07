'use client'

import { useEffect } from 'react'

export function HeroFade() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.hero-fs')
    if (!root) return

    let raf = 0

    const update = () => {
      const scrollY = window.scrollY || window.pageYOffset
      const viewportH = window.innerHeight || 1
      const fade = Math.min(1, scrollY / (viewportH * 0.6))
      root.style.setProperty('--hero-fade', fade.toFixed(3))
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
