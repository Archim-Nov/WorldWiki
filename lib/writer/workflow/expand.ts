import type { WriterOutlineBlock, WriterSchemaSummary, WriterSession } from '@/types/writer'

export function pickOutlineBlocksForExpansion(session: WriterSession, outlineBlockIds?: string[]) {
  const outline = session.outline ?? []
  if (outline.length === 0) return [] as WriterOutlineBlock[]

  if (outlineBlockIds && outlineBlockIds.length > 0) {
    const wanted = new Set(outlineBlockIds)
    return outline.filter((block) => wanted.has(block.id))
  }

  const accepted = outline.filter((block) => block.status === 'accepted')
  if (accepted.length > 0) return accepted

  return outline.slice(0, 1)
}

export function buildOutlineExpansionInstruction(args: {
  schema: WriterSchemaSummary
  blocks: WriterOutlineBlock[]
  existingInstruction?: string
}) {
  const { schema, blocks, existingInstruction } = args
  const trimmed = existingInstruction?.trim()
  if (trimmed) return trimmed

  if (blocks.length === 0) {
    return `根据当前意图卡与 schema，为 ${schema.title} 生成一版完整字段草稿，优先补全核心信息与正文。`
  }

  const blockDescriptions = blocks
    .map((block) => {
      const fields = block.mappedFields.length > 0 ? block.mappedFields.join('、') : '相关字段'
      return `【${block.title}】${block.summary}；重点覆盖字段：${fields}`
    })
    .join('\n')

  return [
    `请基于已确认的条目雏形，为 ${schema.title} 扩写结构化字段草稿。`,
    '优先展开以下雏形块：',
    blockDescriptions,
    '保持世界观一致，不要改动已锁定字段；未涉及的字段尽量少改。',
  ].join('\n')
}

export function markOutlineBlocksExpanded(outline: WriterOutlineBlock[] | undefined, outlineBlockIds?: string[]) {
  if (!outline || outline.length === 0) return outline

  const targetIds = new Set(
    outlineBlockIds && outlineBlockIds.length > 0
      ? outlineBlockIds
      : outline.filter((block) => block.status === 'accepted').map((block) => block.id)
  )

  if (targetIds.size === 0) return outline

  return outline.map((block) =>
    targetIds.has(block.id)
      ? {
          ...block,
          status: 'expanded' as const,
        }
      : block
  )
}
