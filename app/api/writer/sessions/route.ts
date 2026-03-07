import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, normalizeStringArray, readJsonObject } from '@/lib/writer/api/validators'
import { createWriterSession, listWriterSessions } from '@/lib/writer/storage/sessions'
import { classifyWriterType } from '@/lib/writer/classifier/service'
import { WRITER_DOCUMENT_TYPES } from '@/lib/writer/constants'
import { createConceptCard, getInitialWriterStage } from '@/lib/writer/workflow/conversation'

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

  const title = typeof body.title === 'string' ? body.title : undefined
  const sourceText = typeof body.sourceText === 'string' ? body.sourceText : undefined
  const workflowMode = body.workflowMode === 'conversation' ? 'conversation' : 'direct'

  let documentType = typeof body.documentType === 'string' ? body.documentType : ''
  const suggestions = await classifyWriterType([title, sourceText].filter(Boolean).join('\n'))
  if (!WRITER_DOCUMENT_TYPES.includes(documentType as never)) {
    documentType = suggestions[0]?.documentType ?? 'story'
  }

  const session = await createWriterSession({
    documentType: documentType as never,
    title,
    sourceText,
    providerId: typeof body.providerId === 'string' ? body.providerId : undefined,
    presetIds: normalizeStringArray(body.presetIds),
    workflowMode,
    stage: getInitialWriterStage(workflowMode),
    conceptCard:
      workflowMode === 'conversation'
        ? createConceptCard({
            title,
            sourceText,
            documentType: documentType as never,
            suggestions,
          })
        : undefined,
  })

  return NextResponse.json(session, { status: 201 })
}
