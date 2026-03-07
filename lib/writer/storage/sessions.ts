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

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[]
  return value.filter((item): item is string => typeof item === 'string')
}

function inferWorkflowMode(session: Partial<WriterSession>) {
  if (session.workflowMode === 'conversation' || session.workflowMode === 'direct') {
    return session.workflowMode
  }

  if (session.conceptCard || (Array.isArray(session.outline) && session.outline.length > 0)) {
    return 'conversation' as const
  }

  return 'direct' as const
}

function normalizeConceptCard(args: {
  documentType: WriterDocumentType
  title: string
  sourceText: string
  workflowMode: WriterWorkflowMode
  conceptCard?: WriterConceptCard
}) {
  const fallback = createConceptCard({
    title: args.title,
    sourceText: args.sourceText,
    documentType: args.documentType,
  })

  if (!args.conceptCard) {
    return args.workflowMode === 'conversation' ? fallback : undefined
  }

  return {
    ...fallback,
    ...args.conceptCard,
    goals: normalizeStringArray(args.conceptCard.goals),
    constraints: normalizeStringArray(args.conceptCard.constraints),
    openQuestions: normalizeStringArray(args.conceptCard.openQuestions),
    candidateTypes: Array.isArray(args.conceptCard.candidateTypes) ? args.conceptCard.candidateTypes : fallback.candidateTypes,
    decisions: Array.isArray(args.conceptCard.decisions) ? args.conceptCard.decisions : fallback.decisions,
    updatedAt: typeof args.conceptCard.updatedAt === 'string' ? args.conceptCard.updatedAt : fallback.updatedAt,
  }
}

export function normalizeWriterSession(session: WriterSession): WriterSession {
  const createdAt = typeof session.createdAt === 'string' ? session.createdAt : createTimestamp()
  const updatedAt = typeof session.updatedAt === 'string' ? session.updatedAt : createdAt
  const title = typeof session.title === 'string' && session.title.trim() ? session.title : 'Untitled Entry'
  const workflowMode = inferWorkflowMode(session)
  const sourceText = typeof session.draft?.sourceText === 'string' ? session.draft.sourceText : ''
  const draftFields = session.draft?.fields && typeof session.draft.fields === 'object' ? deepClone(session.draft.fields) : createInitialFields(session.documentType, title)

  return {
    ...session,
    title,
    presetIds: normalizeStringArray(session.presetIds),
    createdAt,
    updatedAt,
    workflowMode,
    stage: session.stage ?? getInitialWriterStage(workflowMode),
    status: session.status === 'checked' || session.status === 'submitted' ? session.status : 'draft',
    messages: Array.isArray(session.messages) ? session.messages : [],
    draft: {
      documentType: session.documentType,
      sourceText,
      fields: draftFields,
      lockedFields: normalizeStringArray(session.draft?.lockedFields),
      updatedAt: typeof session.draft?.updatedAt === 'string' ? session.draft.updatedAt : updatedAt,
    },
    conceptCard: normalizeConceptCard({
      documentType: session.documentType,
      title,
      sourceText,
      workflowMode,
      conceptCard: session.conceptCard,
    }),
    outline: Array.isArray(session.outline) ? session.outline : undefined,
    calibrationPatches: Array.isArray(session.calibrationPatches) ? session.calibrationPatches : [],
    lastCheck: session.lastCheck && typeof session.lastCheck === 'object' ? session.lastCheck : undefined,
  }
}

export async function listWriterSessions() {
  await ensureWriterStorage()
  const files = await listJsonFiles(getWriterSessionsDir())
  const sessions = await Promise.all(
    files.map((file) => readJsonFile<WriterSession>(`${getWriterSessionsDir()}/${file}`, null as never))
  )

  return sessions.filter(Boolean).map(normalizeWriterSession).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function getWriterSession(id: string) {
  await ensureWriterStorage()
  const session = await readJsonFile<WriterSession | null>(getWriterSessionPath(id), null)
  return session ? normalizeWriterSession(session) : null
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
  const session = normalizeWriterSession({
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
  })

  await writeJsonFile(getWriterSessionPath(session.id), session)
  await saveSnapshot(session.id, session.draft, 'session-created')
  return session
}

export async function updateWriterSession(id: string, patch: Partial<WriterSession>) {
  const current = await getWriterSession(id)
  if (!current) return null

  const next = normalizeWriterSession({
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
  } as WriterSession)

  await writeJsonFile(getWriterSessionPath(id), next)
  if (patch.draft) {
    await saveSnapshot(id, next.draft, 'session-updated')
  }
  return next
}

export async function deleteWriterSession(id: string) {
  await deleteJsonFile(getWriterSessionPath(id))
}
