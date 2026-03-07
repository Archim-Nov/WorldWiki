import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { getWriterSession, updateWriterSession } from '@/lib/writer/storage/sessions'
import { runWriterChecks } from '@/lib/writer/checkers/consistency'

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
  if (!sessionId) return badRequest('missing_session_id')

  const session = await getWriterSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const lastCheck = await runWriterChecks(session.draft)
  const nextSession = await updateWriterSession(sessionId, {
    lastCheck,
    stage: session.workflowMode === 'conversation' ? 'review' : session.stage,
    status: lastCheck.issues.some((issue) => issue.level === 'error') ? 'draft' : 'checked',
  })

  return NextResponse.json({
    lastCheck,
    session: nextSession,
  })
}
