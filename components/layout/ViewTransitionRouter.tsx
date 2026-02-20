'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withLocalePrefix, hasLocalePrefix } from '@/i18n/path'
import { defaultLocale, isValidLocale, localeCookieName } from '@/i18n/routing'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    finished: Promise<void>
  }
}

function isModifiedEvent(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

function readLocaleCookie(): string | null {
  const cookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${localeCookieName}=`))

  if (!cookie) return null
  return decodeURIComponent(cookie.split('=').slice(1).join('='))
}

function resolveClientLocale(pathname: string): string {
  const firstSegment = pathname.split('/')[1]
  if (isValidLocale(firstSegment)) {
    return firstSegment
  }

  const cookieLocale = readLocaleCookie()
  if (isValidLocale(cookieLocale)) {
    return cookieLocale
  }

  return defaultLocale
}

export function ViewTransitionRouter() {
  const router = useRouter()

  useEffect(() => {
    const doc = document as ViewTransitionDocument
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

      const activeLocale = resolveClientLocale(window.location.pathname)
      const localizedPathname = hasLocalePrefix(url.pathname)
        ? url.pathname
        : withLocalePrefix(url.pathname, activeLocale)

      const currentPath = `${window.location.pathname}${window.location.search}`
      const nextPath = `${localizedPathname}${url.search}`
      if (nextPath === currentPath) return

      event.preventDefault()
      if (typeof doc.startViewTransition === 'function') {
        doc.startViewTransition(() => {
          router.push(`${localizedPathname}${url.search}${url.hash}`)
        })
        return
      }

      router.push(`${localizedPathname}${url.search}${url.hash}`)
    }

    document.addEventListener('click', onClick)
    return () => {
      delete document.documentElement.dataset.viewTransition
      document.removeEventListener('click', onClick)
    }
  }, [router])

  return null
}
