import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, normalizeStringArray, readJsonObject } from '@/lib/writer/api/validators'
import { createWriterSession, listWriterSessions } from '@/lib/writer/storage/sessions'
import { classifyWriterType } from '@/lib/writer/classifier/service'
import { WRITER_DOCUMENT_TYPES } from '@/lib/writer/constants'

export async function GET() {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  return NextResponse.json(await listWriterSessions())
}

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  let documentType = typeof body.documentType === 'string' ? body.documentType : ''
  if (!WRITER_DOCUMENT_TYPES.includes(documentType as never)) {
    const suggestions = await classifyWriterType(typeof body.sourceText === 'string' ? body.sourceText : '')
    documentType = suggestions[0]?.documentType ?? 'story'
  }

  const session = await createWriterSession({
    documentType: documentType as never,
    title: typeof body.title === 'string' ? body.title : undefined,
    sourceText: typeof body.sourceText === 'string' ? body.sourceText : undefined,
    providerId: typeof body.providerId === 'string' ? body.providerId : undefined,
    presetIds: normalizeStringArray(body.presetIds),
  })

  return NextResponse.json(session, { status: 201 })
}
