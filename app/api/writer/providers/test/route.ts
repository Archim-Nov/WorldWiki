import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { getProviderInstance } from '@/lib/writer/providers/registry'

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const providerId = typeof body.providerId === 'string' ? body.providerId : ''
  if (!providerId) return badRequest('missing_provider_id')

  const provider = await getProviderInstance(providerId)
  if (!provider) {
    return NextResponse.json({ ok: false, message: 'provider_not_found' }, { status: 404 })
  }

  try {
    const result = await provider.testConnection()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'provider_test_failed',
      },
      { status: 500 }
    )
  }
}
