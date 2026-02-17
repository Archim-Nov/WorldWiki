import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

const typeToRoute: Record<string, string> = {
  country: 'countries',
  region: 'regions',
  creature: 'creatures',
  hero: 'champions',
  story: 'stories',
  magic: 'magics',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body?._type && typeToRoute[body._type]) {
      const routeBase = `/${typeToRoute[body._type]}`
      revalidatePath(routeBase)
      if (body.slug?.current) {
        revalidatePath(`${routeBase}/${body.slug.current}`)
      }
      revalidatePath('/')
    }

    return NextResponse.json({ revalidated: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}
