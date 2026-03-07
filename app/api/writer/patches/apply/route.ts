import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, normalizeStringArray, readJsonObject } from '@/lib/writer/api/validators'
import { runWriterChecks } from '@/lib/writer/checkers/consistency'
import { getWriterSchemaSummary } from '@/lib/writer/schema/introspect'
import { getWriterSession, updateWriterSession } from '@/lib/writer/storage/sessions'
import { applyWriterCalibrationPatches, buildWriterCalibrationPatches } from '@/lib/writer/workflow/calibration'

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
  const patchIds = normalizeStringArray(body.patchIds)
  if (!sessionId) return badRequest('missing_session_id')

  const session = await getWriterSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const { draft, appliedPatches } = applyWriterCalibrationPatches({
    session,
    patchIds,
  })

  if (appliedPatches.length === 0) {
    return NextResponse.json({ error: 'no_patches_applied' }, { status: 400 })
  }

  const lastCheck = await runWriterChecks(draft)
  const schema = getWriterSchemaSummary(session.documentType)
  const calibrationPatches = buildWriterCalibrationPatches({
    session: {
      ...session,
      draft,
      lastCheck,
    },
    schema,
    checkResult: lastCheck,
  })

  const nextSession = await updateWriterSession(sessionId, {
    draft,
    lastCheck,
    calibrationPatches,
    stage: session.workflowMode === 'conversation' ? (calibrationPatches.length > 0 ? 'calibration' : 'review') : session.stage,
    status: lastCheck.issues.some((issue) => issue.level === 'error') ? 'draft' : 'checked',
  })

  return NextResponse.json({
    appliedPatches,
    lastCheck,
    patches: calibrationPatches,
    session: nextSession,
  })
}
