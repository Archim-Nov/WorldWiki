import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, normalizeStringArray, readJsonObject } from '@/lib/writer/api/validators'
import { WRITER_DOCUMENT_TYPES } from '@/lib/writer/constants'
import { createWriterSession, updateWriterSession } from '@/lib/writer/storage/sessions'
import { loadExistingWriterDraft } from '@/lib/writer/sanity/existing-doc'

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const documentType = typeof body.documentType === 'string' ? body.documentType : ''
  const lookup = typeof body.lookup === 'string' ? body.lookup : ''

  if (!WRITER_DOCUMENT_TYPES.includes(documentType as never)) {
    return badRequest('invalid_document_type')
  }

  if (!lookup.trim()) {
    return badRequest('missing_lookup')
  }

  const imported = await loadExistingWriterDraft(documentType as never, lookup)
  if (!imported) {
    return NextResponse.json({ error: 'document_not_found' }, { status: 404 })
  }

  const session = await createWriterSession({
    documentType: documentType as never,
    title: imported.title,
    sourceText: imported.draft.sourceText,
    providerId: typeof body.providerId === 'string' ? body.providerId : undefined,
    presetIds: normalizeStringArray(body.presetIds),
    workflowMode: 'conversation',
  })

  const patchedSession = await updateWriterSession(session.id, {
    draft: imported.draft,
  })

  return NextResponse.json(patchedSession ?? session, { status: 201 })
}
