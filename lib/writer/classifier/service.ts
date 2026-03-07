import type { WriterTypeSuggestion } from '@/types/writer'
import { classifyWriterTypeWithRules } from '@/lib/writer/classifier/rules'

export async function classifyWriterType(text: string): Promise<WriterTypeSuggestion[]> {
  const suggestions = classifyWriterTypeWithRules(text)
  const bestScore = suggestions[0]?.score ?? 0

  if (bestScore > 0) {
    return suggestions
  }

  return suggestions.map((item, index) => ({
    ...item,
    score: Math.max(0, 1 - index * 0.1),
    reason: '基于兜底排序给出候选类型',
  }))
}
