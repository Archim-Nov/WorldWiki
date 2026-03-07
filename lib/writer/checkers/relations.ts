import 'server-only'

import type { WriterDraft, WriterRelatedSuggestion } from '@/types/writer'
import { searchWriterReferences } from '@/lib/writer/sanity/reference-search'

function collectSearchTerms(draft: WriterDraft) {
  const title = String(draft.fields.name ?? draft.fields.title ?? '').trim()
  const sourceText = draft.sourceText.trim()
  return [title, sourceText].filter(Boolean)
}

export async function suggestRelatedReferences(draft: WriterDraft): Promise<WriterRelatedSuggestion[]> {
  const terms = collectSearchTerms(draft)
  const [primaryTerm] = terms
  if (!primaryTerm) return []

  const items = await searchWriterReferences(primaryTerm, 6)
  return items.map((item) => ({
    refId: item.refId,
    type: item.type,
    label: item.label,
    reason: '与标题或简介内容相关',
  }))
}
