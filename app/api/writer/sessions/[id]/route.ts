import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { deleteWriterSession, getWriterSession, updateWriterSession } from '@/lib/writer/storage/sessions'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const { id } = await context.params
  const session = await getWriterSession(id)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json(session)
}

export async function PATCH(request: Request, context: RouteContext) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const { id } = await context.params
  const nextSession = await updateWriterSession(id, {
    title: typeof body.title === 'string' ? body.title : undefined,
    providerId: typeof body.providerId === 'string' ? body.providerId : undefined,
    presetIds: Array.isArray(body.presetIds) ? (body.presetIds as string[]) : undefined,
    workflowMode: body.workflowMode === 'conversation' || body.workflowMode === 'direct' ? body.workflowMode : undefined,
    stage:
      body.stage === 'conversation' ||
      body.stage === 'outline' ||
      body.stage === 'drafting' ||
      body.stage === 'calibration' ||
      body.stage === 'review' ||
      body.stage === 'submitted'
        ? body.stage
        : undefined,
    status:
      body.status === 'draft' || body.status === 'checked' || body.status === 'submitted'
        ? body.status
        : undefined,
    messages: Array.isArray(body.messages) ? (body.messages as never) : undefined,
    draft: body.draft && typeof body.draft === 'object' ? (body.draft as never) : undefined,
    conceptCard: body.conceptCard && typeof body.conceptCard === 'object' ? (body.conceptCard as never) : undefined,
    outline: Array.isArray(body.outline) ? (body.outline as never) : undefined,
    lastCheck: body.lastCheck && typeof body.lastCheck === 'object' ? (body.lastCheck as never) : undefined,
  })

  if (!nextSession) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json(nextSession)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const { id } = await context.params
  await deleteWriterSession(id)
  return NextResponse.json({ success: true })
}
