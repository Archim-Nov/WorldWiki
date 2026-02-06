import Link from 'next/link'
import { PortableText, type PortableTextComponents } from 'next-sanity'
import clsx from 'clsx'

const typeToRoute: Record<string, string> = {
  country: 'countries',
  region: 'regions',
  creature: 'creatures',
  hero: 'champions',
  story: 'stories',
}

const components: PortableTextComponents = {
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
        <Link href={`/${route}/${slug}`} className="text-primary underline">
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
        <a
          href={href}
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      )
    },
  },
}

export function PortableContent({
  value,
  className,
}: {
  value: unknown
  className?: string
}) {
  return (
    <div className={clsx('space-y-4 text-sm text-muted-foreground leading-7', className)}>
      <PortableText value={value} components={components} />
    </div>
  )
}
