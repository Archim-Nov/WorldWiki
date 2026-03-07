import type { WriterGenerationResult, WriterNextAction, WriterOutlineBlock } from '@/types/writer'
import { createWriterId } from '@/lib/writer/utils'

function extractJsonBlock(rawText: string) {
  const fencedMatch = rawText.match(/```json\s*([\s\S]*?)```/i)
  return fencedMatch?.[1] ?? rawText
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isWriterNextAction(value: unknown): value is WriterNextAction {
  return (
    value === 'continue-conversation' ||
    value === 'create-outline' ||
    value === 'start-drafting' ||
    value === 'run-calibration' ||
    value === 'submit'
  )
}

function parseOutline(value: unknown) {
  if (!Array.isArray(value)) return undefined

  const outline = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const title = typeof record.title === 'string' ? record.title.trim() : ''
      const summary = typeof record.summary === 'string' ? record.summary.trim() : ''
      if (!title || !summary) return null

      return {
        id: typeof record.id === 'string' && record.id.trim() ? record.id.trim() : createWriterId('outline'),
        title,
        summary,
        mappedFields: Array.isArray(record.mappedFields)
          ? record.mappedFields.filter((field): field is string => typeof field === 'string' && field.trim().length > 0)
          : [],
        status:
          record.status === 'accepted' || record.status === 'expanded' ? record.status : 'pending',
      } satisfies WriterOutlineBlock
    })
    .filter(Boolean) as WriterOutlineBlock[]

  return outline.length > 0 ? outline : undefined
}

export function parseWriterResponse(rawText: string): WriterGenerationResult {
  try {
    const parsed = JSON.parse(extractJsonBlock(rawText)) as Record<string, unknown>

    return {
      assistantMessage:
        typeof parsed.assistantMessage === 'string' && parsed.assistantMessage.trim().length > 0
          ? parsed.assistantMessage.trim()
          : '已生成可继续创作的结果。',
      title: typeof parsed.title === 'string' && parsed.title.trim().length > 0 ? parsed.title.trim() : undefined,
      fields: isRecord(parsed.fields) ? parsed.fields : {},
      conceptCard: isRecord(parsed.conceptCard) ? parsed.conceptCard : undefined,
      outline: parseOutline(parsed.outline),
      suggestedNextAction: isWriterNextAction(parsed.suggestedNextAction) ? parsed.suggestedNextAction : undefined,
      rawText,
    }
  } catch {
    return {
      assistantMessage: rawText.trim() || '模型未返回可解析内容。',
      fields: {},
      rawText,
    }
  }
}
