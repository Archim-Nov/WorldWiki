'use client'

import { useEffect, useRef } from 'react'

export function StoryScrollReveal() {
  const debugRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.story-detail')
    const body = document.querySelector<HTMLElement>('.story-body-wrap')
    if (!root || !body) {
      return
    }

    const findScrollParent = (node: HTMLElement | null) => {
      let current: HTMLElement | null = node
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current)
        if (/(auto|scroll)/.test(style.overflowY)) {
          return current
        }
        current = current.parentElement
      }
      return null
    }

    const scrollParent = findScrollParent(body)
    const scrollTarget: Window | HTMLElement = scrollParent ?? window
    const targetLabel = scrollTarget === window ? 'window' : 'parent'

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
      const start = viewportHeight * 0.92
      const end = viewportHeight * 0.28
      const raw = (start - relativeTop) / (start - end)
      const clamped = Math.max(0, Math.min(1, raw))
      const scrollY =
        scrollTarget === window
          ? window.scrollY
          : (scrollTarget as HTMLElement).scrollTop

      root.style.setProperty('--story-veil', clamped.toFixed(3))
      if (debugRef.current) {
        debugRef.current.textContent = `veil ${clamped.toFixed(
          2
        )} | y ${Math.round(scrollY)} | top ${Math.round(
          relativeTop
        )} | ${targetLabel}`
      }
      if (clamped > 0.02) {
        root.dataset.storyRevealed = 'true'
      } else {
        delete root.dataset.storyRevealed
      }

      raf = 0
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    update()
    const intervalId = window.setInterval(update, 800)
    scrollTarget.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.clearInterval(intervalId)
      scrollTarget.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) {
        window.cancelAnimationFrame(raf)
      }
    }
  }, [])

  return <div ref={debugRef} className="story-scroll-debug" />
}
