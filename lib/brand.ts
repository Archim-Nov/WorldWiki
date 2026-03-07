export const worldName = 'Austrum'
export const worldNameZh = '奥斯特姆'
export const atlasName = 'Atlas of Austrum'

const brandDescriptions = {
  'zh-CN': '探索 Austrum 的国家、区域、生物、英雄、故事与魔法。',
  en: 'Explore Austrum through its countries, regions, creatures, champions, stories, and magic.',
} as const

export function getBrandName(_locale?: string | null) {
  return worldName
}

export function getBrandDescription(locale?: string | null) {
  return locale === 'en' ? brandDescriptions.en : brandDescriptions['zh-CN']
}
