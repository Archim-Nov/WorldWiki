import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { getWriterSession, updateWriterSession } from '@/lib/writer/storage/sessions'
import { publishWriterDocument, submitWriterDraft } from '@/lib/writer/sanity/submit'
import { getSanityWriteConfigStatus } from '@/lib/sanity/write-client'

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
  const action = body.action === 'publish' ? 'publish' : 'saveDraft'
  if (!sessionId) return badRequest('missing_session_id')

  const session = await getWriterSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  try {
    const draftResult = await submitWriterDraft(session)

    const nextFields = {
      ...session.draft.fields,
      __documentId: draftResult.documentId,
    }

    let publishResult: { documentId: string } | null = null
    if (action === 'publish') {
      publishResult = await publishWriterDocument(draftResult.documentId)
    }

    const nextSession = await updateWriterSession(sessionId, {
      stage: 'submitted',
      status: 'submitted',
      draft: {
        ...session.draft,
        fields: nextFields,
      },
    })

    return NextResponse.json({
      success: true,
      action,
      draftResult,
      publishResult,
      session: nextSession,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'sanity_write_disabled') {
      const status = getSanityWriteConfigStatus()

      return NextResponse.json(
        {
          error: 'sanity_write_disabled',
          message: status.reason ?? 'Sanity push is currently unavailable.',
          hint: status.hint,
          missingEnvVars: status.missingEnvVars,
          tokenSource: status.tokenSource,
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'submit_failed',
      },
      { status: 500 }
    )
  }
}