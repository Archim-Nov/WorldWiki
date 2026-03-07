import type { WriterCheckResult, WriterDraft } from '@/types/writer'
import { createTimestamp } from '@/lib/writer/utils'
import { validateWriterDraft } from '@/lib/writer/checkers/schema'
import { findPotentialDuplicates } from '@/lib/writer/checkers/duplicates'
import { suggestRelatedReferences } from '@/lib/writer/checkers/relations'
import { runLoreRuleChecks } from '@/lib/writer/checkers/lore-rules'

export async function runWriterChecks(draft: WriterDraft): Promise<WriterCheckResult> {
  const baseIssues = validateWriterDraft(draft)
  const [duplicates, relatedSuggestions, loreIssues] = await Promise.all([
    findPotentialDuplicates(draft),
    suggestRelatedReferences(draft),
    runLoreRuleChecks(draft),
  ])

  return {
    issues: [...baseIssues, ...loreIssues],
    duplicates,
    relatedSuggestions,
    checkedAt: createTimestamp(),
  }
}
