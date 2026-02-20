import Link from 'next/link'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { PortableText, type PortableTextBlock, type PortableTextComponents } from 'next-sanity'
import clsx from 'clsx'
import { withLocalePrefix } from '@/i18n/path'

const typeToRoute: Record<string, string> = {
  country: 'countries',
  region: 'regions',
  creature: 'creatures',
  hero: 'champions',
  story: 'stories',
  magic: 'magics',
}

export async function PortableContent({
  value,
  className,
}: {
  value: unknown
  className?: string
}) {
  const locale = await getLocale()

  const components: PortableTextComponents = {
    types: {
      image: ({ value }) => {
        const url = value?.asset?.url ?? value?.asset?._ref
        if (!url) return null
        const alt = value?.alt ?? ''
        return (
          <figure className="portable-image-bleed">
            <Image
              src={url}
              alt={alt}
              width={1600}
              height={900}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 900px"
            />
            {value?.caption && <figcaption>{value.caption}</figcaption>}
          </figure>
        )
      },
    },
    marks: {
      internalLink: ({ value, children }) => {
        const reference = value?.reference
        const type = reference?._type
        const slug = reference?.slug?.current
        const route = type ? typeToRoute[type] : null

        if (!route || !slug) {
          return <span className="underline decoration-dotted">{children}</span>
        }

        return (
          <Link href={withLocalePrefix(`/${route}/${slug}`, locale)} className="text-primary underline">
            {children}
          </Link>
        )
      },
      externalLink: ({ value, children }) => {
        const href = value?.url
        if (!href) {
          return <span className="underline decoration-dotted">{children}</span>
        }

        return (
          <a href={href} className="text-primary underline" target="_blank" rel="noreferrer">
            {children}
          </a>
        )
      },
    },
  }

  return (
    <div className={clsx('space-y-4 text-sm text-muted-foreground leading-7', className)}>
      <PortableText value={value as PortableTextBlock[]} components={components} />
    </div>
  )
}
