import type { WriterDocumentType, WriterFieldGroup } from '@/types/writer'

type DocumentConfig = {
  titleField: string
  slugField: string
  bodyField?: string
  groups: WriterFieldGroup[]
}

export const writerDocumentConfigMap: Record<WriterDocumentType, DocumentConfig> = {
  country: {
    titleField: 'name',
    slugField: 'slug',
    bodyField: 'summary',
    groups: [
      { id: 'identity', title: '基础信息', fieldNames: ['name', 'slug', 'kind', 'summary'] },
      { id: 'governance', title: '国家结构', fieldNames: ['capital', 'governance', 'population', 'currency'] },
      { id: 'culture', title: '文化与风貌', fieldNames: ['languages', 'motto', 'customs', 'themeColor'] },
      { id: 'relations', title: '关联', fieldNames: ['featuredRegions', 'mapImage'] },
    ],
  },
  region: {
    titleField: 'name',
    slugField: 'slug',
    bodyField: 'summary',
    groups: [
      { id: 'identity', title: '基础信息', fieldNames: ['name', 'slug', 'summary', 'country'] },
      { id: 'geography', title: '地理环境', fieldNames: ['climate', 'terrain', 'landmarks', 'mapImage'] },
      { id: 'travel', title: '旅行与风险', fieldNames: ['dangerLevel', 'travelAdvice', 'themeColor'] },
      { id: 'relations', title: '关联', fieldNames: ['featuredHeroes'] },
    ],
  },
  creature: {
    titleField: 'name',
    slugField: 'slug',
    bodyField: 'bio',
    groups: [
      { id: 'identity', title: '基础信息', fieldNames: ['name', 'slug', 'species', 'category', 'portrait'] },
      { id: 'habits', title: '生态习性', fieldNames: ['temperament', 'habitat', 'diet', 'activityCycle', 'threatLevel', 'abilities'] },
      { id: 'lore', title: '条目正文', fieldNames: ['bio'] },
      { id: 'relations', title: '关联', fieldNames: ['region', 'country', 'relatedStories'] },
    ],
  },
  hero: {
    titleField: 'name',
    slugField: 'slug',
    bodyField: 'bio',
    groups: [
      { id: 'identity', title: '身份信息', fieldNames: ['name', 'title', 'alias', 'slug', 'portrait'] },
      { id: 'status', title: '状态与阵营', fieldNames: ['age', 'status', 'roles', 'faction', 'signatureWeapon', 'motto'] },
      { id: 'lore', title: '条目正文', fieldNames: ['bio'] },
      { id: 'relations', title: '关联', fieldNames: ['region', 'country', 'relatedHeroes'] },
    ],
  },
  story: {
    titleField: 'title',
    slugField: 'slug',
    bodyField: 'content',
    groups: [
      { id: 'identity', title: '基础信息', fieldNames: ['title', 'slug', 'coverImage'] },
      { id: 'content', title: '正文', fieldNames: ['content'] },
      { id: 'relations', title: '关联', fieldNames: ['relatedHeroes', 'relatedRegions', 'relatedCreatures'] },
    ],
  },
  magic: {
    titleField: 'name',
    slugField: 'slug',
    bodyField: 'details',
    groups: [
      { id: 'identity', title: '基础信息', fieldNames: ['name', 'slug', 'kind', 'school', 'element', 'summary', 'coverImage'] },
      { id: 'mechanics', title: '机制', fieldNames: ['difficulty', 'castType', 'manaCost', 'cooldown', 'requirements', 'risks'] },
      { id: 'details', title: '正文', fieldNames: ['details'] },
      { id: 'relations', title: '关联', fieldNames: ['relatedHeroes', 'relatedStories'] },
    ],
  },
}

export function getDocumentConfig(documentType: WriterDocumentType) {
  return writerDocumentConfigMap[documentType]
}
