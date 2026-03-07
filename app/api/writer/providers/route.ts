import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, normalizeStringArray, readJsonObject } from '@/lib/writer/api/validators'
import {
  deleteProviderConfig,
  listProviderSummaries,
  saveProviderConfig,
} from '@/lib/writer/storage/providers'

export async function GET() {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  return NextResponse.json(await listProviderSummaries())
}

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const provider = await saveProviderConfig({
    id: typeof body.id === 'string' ? body.id : undefined,
    name: typeof body.name === 'string' ? body.name : undefined,
    kind: body.kind === 'cli' ? 'cli' : 'openai-compatible',
    enabled: body.enabled !== false,
    model: typeof body.model === 'string' ? body.model : undefined,
    baseUrl: typeof body.baseUrl === 'string' ? body.baseUrl : undefined,
    apiKey: typeof body.apiKey === 'string' ? body.apiKey : undefined,
    command: typeof body.command === 'string' ? body.command : undefined,
    args: normalizeStringArray(body.args),
    temperature:
      typeof body.temperature === 'number' && Number.isFinite(body.temperature)
        ? body.temperature
        : undefined,
  })

  return NextResponse.json(provider)
}

export async function DELETE(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const id = new URL(request.url).searchParams.get('id')?.trim()
  if (!id) return badRequest('missing_id')

  await deleteProviderConfig(id)
  return NextResponse.json({ success: true })
}
