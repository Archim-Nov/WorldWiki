import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { withLocalePrefix } from '@/i18n/path'
import { locales } from '@/i18n/routing'

const typeToRoute: Record<string, string> = {
  country: 'countries',
  region: 'regions',
  creature: 'creatures',
  hero: 'champions',
  story: 'stories',
  magic: 'magics',
}

type WebhookBody = {
  _type?: string
  slug?: { current?: string }
}

const WEBHOOK_SECRET_HEADER = 'x-sanity-webhook-secret'

function revalidateLocalizedPath(path: string) {
  const paths = new Set([path, ...locales.map((locale) => withLocalePrefix(path, locale))])

  for (const targetPath of paths) {
    revalidatePath(targetPath)
  }
}

function validateWebhookSecret(request: Request) {
  const expected = process.env.SANITY_WEBHOOK_SECRET
  if (!expected) {
    return NextResponse.json(
      { error: 'SANITY_WEBHOOK_SECRET is not configured' },
      { status: 500 }
    )
  }

  const provided = request.headers.get(WEBHOOK_SECRET_HEADER)
  if (provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

export async function POST(request: Request) {
  const authError = validateWebhookSecret(request)
  if (authError) {
    return authError
  }

  try {
    const body = (await request.json()) as WebhookBody

    if (body?._type && typeToRoute[body._type]) {
      const routeBase = `/${typeToRoute[body._type]}`
      revalidateTag('home-page', 'max')
      revalidateLocalizedPath(routeBase)
      if (body.slug?.current) {
        revalidateLocalizedPath(`${routeBase}/${body.slug.current}`)
      }
      revalidateLocalizedPath('/')
    }

    return NextResponse.json({ revalidated: true })
  } catch {
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}
