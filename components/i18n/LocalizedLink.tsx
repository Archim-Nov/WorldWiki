'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { ComponentProps } from 'react'
import type { UrlObject } from 'url'
import { withLocalePrefix } from '@/i18n/path'
import { defaultLocale, isValidLocale, type AppLocale } from '@/i18n/routing'

type LinkHref = ComponentProps<typeof Link>['href']

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: LinkHref
}

function resolveLocale(localeFromIntl: string): AppLocale {
  return isValidLocale(localeFromIntl) ? localeFromIntl : defaultLocale
}

function localizeHref(href: LinkHref, locale: AppLocale): LinkHref {
  if (typeof href === 'string') {
    return withLocalePrefix(href, locale)
  }

  if (href && typeof href === 'object') {
    const url = href as UrlObject
    if (typeof url.pathname === 'string') {
      return {
        ...url,
        pathname: withLocalePrefix(url.pathname, locale),
      }
    }
  }

  return href
}

export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const locale = resolveLocale(useLocale())
  return <Link href={localizeHref(href, locale)} {...props} />
}
