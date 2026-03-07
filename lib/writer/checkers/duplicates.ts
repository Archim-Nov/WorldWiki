import 'server-only'

import type { WriterDraft, WriterDuplicateCandidate } from '@/types/writer'
import { searchWriterReferences } from '@/lib/writer/sanity/reference-search'

export async function findPotentialDuplicates(draft: WriterDraft): Promise<WriterDuplicateCandidate[]> {
  const title = String(draft.fields.name ?? draft.fields.title ?? '').trim()
  if (!title) return []

  const items = await searchWriterReferences(title, 5)
  return items
    .filter((item) => item.label !== title)
    .map((item) => ({
      id: item.refId,
      type: item.type,
      title: item.label,
      slug: item.slug,
      reason: '名称或关键词与现有条目相近',
    }))
}
