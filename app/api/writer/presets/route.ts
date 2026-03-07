import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { deletePromptPreset, listPromptPresets, savePromptPreset } from '@/lib/writer/storage/presets'

export async function GET() {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  return NextResponse.json(await listPromptPresets())
}

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const preset = await savePromptPreset({
    id: typeof body.id === 'string' ? body.id : undefined,
    name: typeof body.name === 'string' ? body.name : undefined,
    scope:
      body.scope === 'project' || body.scope === 'documentType' || body.scope === 'task'
        ? body.scope
        : 'task',
    documentType: typeof body.documentType === 'string' ? (body.documentType as never) : undefined,
    content: typeof body.content === 'string' ? body.content : undefined,
    enabled: body.enabled !== false,
  })

  return NextResponse.json(preset)
}

export async function DELETE(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const id = new URL(request.url).searchParams.get('id')?.trim()
  if (!id) return badRequest('missing_id')

  await deletePromptPreset(id)
  return NextResponse.json({ success: true })
}
