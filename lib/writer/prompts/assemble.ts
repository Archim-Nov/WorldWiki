import type { WriterDocumentType, WriterPromptPreset, WriterSchemaSummary } from '@/types/writer'

function formatSchema(schema: WriterSchemaSummary) {
  return schema.fields
    .map((field) => {
      const extra = [field.required ? 'required' : null, field.description ?? null]
        .filter(Boolean)
        .join(', ')
      return `- ${field.name} (${field.kind}${extra ? `, ${extra}` : ''})`
    })
    .join('\n')
}

function formatPresets(presets: WriterPromptPreset[]) {
  if (presets.length === 0) return '无额外预设。'
  return presets
    .filter((preset) => preset.enabled)
    .map((preset) => `## ${preset.name}\n${preset.content}`)
    .join('\n\n')
}

export function buildClassificationPrompt(text: string, documentTypes: WriterDocumentType[]) {
  return `请根据以下内容判断它更适合哪一类条目：${documentTypes.join(', ')}。\n\n内容：\n${text}`
}

export function buildGenerationPrompt(args: {
  schema: WriterSchemaSummary
  presets: WriterPromptPreset[]
  sourceText: string
  instruction: string
  currentFields: Record<string, unknown>
}) {
  const { schema, presets, sourceText, instruction, currentFields } = args

  const systemPrompt = [
    '你是一个世界观条目创作助手。',
    '你的任务是根据用户需求与预设，产出结构化条目草稿。',
    '必须返回 JSON，不要添加多余说明。',
    'JSON 结构为：{"assistantMessage": string, "title": string?, "fields": Record<string, unknown>}。',
    '只填写当前条目 schema 允许的字段。',
    `当前条目类型：${schema.documentType}`,
    '字段列表：',
    formatSchema(schema),
    '预设：',
    formatPresets(presets),
  ].join('\n\n')

  const userPrompt = [
    `原始素材：\n${sourceText || '无'}`,
    `当前字段：\n${JSON.stringify(currentFields, null, 2)}`,
    `本次任务：\n${instruction}`,
    '对于富文本字段，请直接返回字符串段落；系统会自动转换为 Portable Text。',
    '对于 slug 字段，只返回字符串，不要返回对象。',
  ].join('\n\n')

  return { systemPrompt, userPrompt }
}
