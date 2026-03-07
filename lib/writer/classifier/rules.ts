import type { WriterDocumentType, WriterTypeSuggestion } from '@/types/writer'
import { WRITER_DOCUMENT_TYPES } from '@/lib/writer/constants'

const keywordMap: Record<WriterDocumentType, string[]> = {
  country: ['国家', '王国', '帝国', '共和国', '政体', '首都', '疆域', 'nation', 'kingdom', 'empire'],
  region: ['区域', '地区', '山脉', '森林', '平原', '地形', '气候', 'region', 'area', 'climate'],
  creature: ['生物', '怪物', '兽', '植物', '物种', '栖息地', 'creature', 'beast', 'species'],
  hero: ['英雄', '人物', '角色', '战士', '法师', '领袖', 'hero', 'character', 'champion'],
  story: ['故事', '传说', '事件', '章节', '剧情', 'story', 'chronicle', 'event'],
  magic: ['魔法', '法术', '元素', '咒语', '仪式', 'magic', 'spell', 'arcane'],
}

export function classifyWriterTypeWithRules(text: string): WriterTypeSuggestion[] {
  const normalizedText = text.toLowerCase()

  return WRITER_DOCUMENT_TYPES.map((documentType) => {
    const keywords = keywordMap[documentType]
    const hits = keywords.filter((keyword) => normalizedText.includes(keyword.toLowerCase())).length

    return {
      documentType,
      score: hits,
      reason: hits > 0 ? `命中 ${hits} 个关键词` : '未命中明显关键词，作为备选类型',
    }
  }).sort((left, right) => right.score - left.score)
}
