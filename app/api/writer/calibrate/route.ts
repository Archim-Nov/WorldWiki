import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { runWriterChecks } from '@/lib/writer/checkers/consistency'
import { getWriterSchemaSummary } from '@/lib/writer/schema/introspect'
import { getWriterSession, updateWriterSession } from '@/lib/writer/storage/sessions'
import { buildWriterCalibrationPatches } from '@/lib/writer/workflow/calibration'

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
  const schema = getWriterSchemaSummary(session.documentType)
  const calibrationPatches = buildWriterCalibrationPatches({
    session: {
      ...session,
      lastCheck,
    },
    schema,
    checkResult: lastCheck,
  })

  const nextSession = await updateWriterSession(sessionId, {
    lastCheck,
    calibrationPatches,
    stage: session.workflowMode === 'conversation' ? 'calibration' : session.stage,
    status: lastCheck.issues.some((issue) => issue.level === 'error') ? 'draft' : 'checked',
  })

  return NextResponse.json({
    lastCheck,
    patches: calibrationPatches,
    session: nextSession,
  })
}
