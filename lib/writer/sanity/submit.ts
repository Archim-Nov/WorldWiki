import 'server-only'

import { getSanityWriteClient } from '@/lib/sanity/write-client'
import { mapDraftToSanityDocument } from '@/lib/writer/sanity/draft-mapper'
import type { WriterSession } from '@/types/writer'
import { slugifyText } from '@/lib/writer/utils'

function getBaseDocumentId(session: WriterSession) {
  const schemaTitleField = session.documentType === 'story' ? 'title' : 'name'
  const titleValue = String(session.draft.fields[schemaTitleField] ?? session.title)
  const slugFieldValue = String(session.draft.fields.slug ?? '')
  const slug = slugFieldValue || slugifyText(titleValue) || session.id
  return `${session.documentType}-${slug}`
}

export async function submitWriterDraft(session: WriterSession) {
  const writeClient = getSanityWriteClient()

  if (!writeClient) {
    throw new Error('sanity_write_disabled')
  }

  const baseId = String(session.draft.fields.__documentId ?? getBaseDocumentId(session))
  const draftId = baseId.startsWith('drafts.') ? baseId : `drafts.${baseId}`
  const document = mapDraftToSanityDocument(session.documentType, session.draft.fields) as {
    _type: string
  } & Record<string, unknown>

  const result = await writeClient.createOrReplace({
    _id: draftId,
    ...document,
  })

  return {
    documentId: baseId,
    draftId,
    result,
  }
}

export async function publishWriterDocument(documentId: string) {
  const writeClient = getSanityWriteClient()

  if (!writeClient) {
    throw new Error('sanity_write_disabled')
  }

  const draftId = documentId.startsWith('drafts.') ? documentId : `drafts.${documentId}`
  const draftDocument = await writeClient.getDocument(draftId)

  if (!draftDocument) {
    throw new Error('draft_not_found')
  }

  const sanitizedDraft = { ...(draftDocument as Record<string, unknown>) }
  delete sanitizedDraft._rev
  delete sanitizedDraft._updatedAt
  delete sanitizedDraft._createdAt

  await writeClient
    .transaction()
    .createOrReplace({
      ...(sanitizedDraft as { _type: string } & Record<string, unknown>),
      _id: documentId,
    })
    .delete(draftId)
    .commit()

  return { documentId }
}