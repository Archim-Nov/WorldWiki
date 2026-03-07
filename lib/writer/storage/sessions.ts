import 'server-only'

import type { WriterConceptCard, WriterDocumentType, WriterSession, WriterWorkflowMode } from '@/types/writer'
import { createTimestamp, createWriterId, deepClone, slugifyText } from '@/lib/writer/utils'
import { getWriterSchemaSummary } from '@/lib/writer/schema/introspect'
import { ensureWriterStorage, deleteJsonFile, listJsonFiles, readJsonFile, writeJsonFile } from '@/lib/writer/storage/fs'
import { getWriterSessionPath, getWriterSessionsDir } from '@/lib/writer/storage/paths'
import { saveSnapshot } from '@/lib/writer/storage/snapshots'
import { createConceptCard, getInitialWriterStage } from '@/lib/writer/workflow/conversation'

function createInitialFields(documentType: WriterDocumentType, title: string) {
  const schema = getWriterSchemaSummary(documentType)
  const titleField = schema.titleField
  const slugField = schema.slugField

  return {
    [titleField]: title,
    [slugField]: slugifyText(title),
  }
}

export async function listWriterSessions() {
  await ensureWriterStorage()
  const files = await listJsonFiles(getWriterSessionsDir())
  const sessions = await Promise.all(
    files.map((file) => readJsonFile<WriterSession>(`${getWriterSessionsDir()}/${file}`, null as never))
  )

  return sessions.filter(Boolean).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function getWriterSession(id: string) {
  await ensureWriterStorage()
  return readJsonFile<WriterSession | null>(getWriterSessionPath(id), null)
}

export async function createWriterSession(input: {
  documentType: WriterDocumentType
  title?: string
  sourceText?: string
  providerId?: string
  presetIds?: string[]
  workflowMode?: WriterWorkflowMode
  stage?: WriterSession['stage']
  conceptCard?: WriterConceptCard
}) {
  await ensureWriterStorage()
  const now = createTimestamp()
  const title = input.title?.trim() || 'Untitled Entry'
  const workflowMode = input.workflowMode ?? 'direct'
  const sourceText = input.sourceText?.trim() ?? ''
  const session: WriterSession = {
    id: createWriterId('session'),
    title,
    documentType: input.documentType,
    providerId: input.providerId,
    presetIds: input.presetIds ?? [],
    createdAt: now,
    updatedAt: now,
    workflowMode,
    stage: input.stage ?? getInitialWriterStage(workflowMode),
    status: 'draft',
    messages: [],
    draft: {
      documentType: input.documentType,
      sourceText,
      fields: createInitialFields(input.documentType, title),
      lockedFields: [],
      updatedAt: now,
    },
    conceptCard:
      input.conceptCard ??
      (workflowMode === 'conversation'
        ? createConceptCard({
            title,
            sourceText,
            documentType: input.documentType,
          })
        : undefined),
  }

  await writeJsonFile(getWriterSessionPath(session.id), session)
  await saveSnapshot(session.id, session.draft, 'session-created')
  return session
}

export async function updateWriterSession(id: string, patch: Partial<WriterSession>) {
  const current = await getWriterSession(id)
  if (!current) return null

  const next: WriterSession = {
    ...current,
    ...patch,
    updatedAt: createTimestamp(),
    draft: patch.draft
      ? {
          ...current.draft,
          ...deepClone(patch.draft),
          updatedAt: createTimestamp(),
        }
      : current.draft,
    conceptCard: patch.conceptCard ? deepClone(patch.conceptCard) : current.conceptCard,
    outline: patch.outline ? deepClone(patch.outline) : current.outline,
    calibrationPatches: patch.calibrationPatches ? deepClone(patch.calibrationPatches) : current.calibrationPatches,
    lastCheck: patch.lastCheck ? deepClone(patch.lastCheck) : current.lastCheck,
  }

  await writeJsonFile(getWriterSessionPath(id), next)
  if (patch.draft) {
    await saveSnapshot(id, next.draft, 'session-updated')
  }
  return next
}

export async function deleteWriterSession(id: string) {
  await deleteJsonFile(getWriterSessionPath(id))
}
