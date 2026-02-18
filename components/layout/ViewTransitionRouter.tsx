'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    finished: Promise<void>
  }
}

function isModifiedEvent(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

export function ViewTransitionRouter() {
  const router = useRouter()

  useEffect(() => {
    const doc = document as ViewTransitionDocument
    if (typeof doc.startViewTransition !== 'function') return

    document.documentElement.dataset.viewTransition = 'enabled'

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
        return
      }

      const target = event.target as Element | null
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return

      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return
      if (anchor.dataset.noViewTransition === 'true') return

      const rel = anchor.getAttribute('rel')
      if (rel && rel.split(/\s+/).includes('external')) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return

      const currentPath = `${window.location.pathname}${window.location.search}`
      const nextPath = `${url.pathname}${url.search}`
      if (nextPath === currentPath) return

      event.preventDefault()
      doc.startViewTransition?.(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`)
      })
    }

    document.addEventListener('click', onClick)
    return () => {
      delete document.documentElement.dataset.viewTransition
      document.removeEventListener('click', onClick)
    }
  }, [router])

  return null
}
