export const MAGIC_KIND_VALUES = ['principle', 'spell'] as const
export const MAGIC_ELEMENT_VALUES = ['fire', 'wind', 'earth', 'water'] as const
export const MAGIC_DIFFICULTY_VALUES = ['beginner', 'intermediate', 'advanced', 'master'] as const
export const MAGIC_CAST_TYPE_VALUES = ['instant', 'channel', 'ritual'] as const

export type MagicKindValue = (typeof MAGIC_KIND_VALUES)[number]
export type MagicElementValue = (typeof MAGIC_ELEMENT_VALUES)[number]
export type MagicDifficultyValue = (typeof MAGIC_DIFFICULTY_VALUES)[number]
export type MagicCastTypeValue = (typeof MAGIC_CAST_TYPE_VALUES)[number]

function normalizeComparableText(value: string) {
  return value.trim().toLowerCase().replace(/[\s()????\[\]{}<>??????,?.:?;?!???/\\_-]+/g, '')
}

function pickNormalizedValue<T extends string>(value: unknown, aliasesByTarget: Array<[T, string[]]>) {
  if (typeof value !== 'string') return null

  const normalized = normalizeComparableText(value)
  if (!normalized) return null

  for (const [target, aliases] of aliasesByTarget) {
    if (aliases.some((alias) => normalized.includes(alias))) {
      return target
    }
  }

  return null
}

export function normalizeMagicKind(value: unknown): MagicKindValue | null {
  return pickNormalizedValue(value, [
    ['principle', ['principle', 'principles', '??', '??', '??', '??']],
    ['spell', ['spell', 'spells', '??', '??', '??']],
  ])
}

export function normalizeMagicElement(value: unknown): MagicElementValue | null {
  return pickNormalizedValue(value, [
    ['fire', ['fire', 'flame', '?', '??', '???']],
    ['wind', ['wind', 'air', '?', '??', '??']],
    ['earth', ['earth', 'stone', 'ground', '?', '?', '??', '??']],
    ['water', ['water', 'ice', '?', '??', '??']],
  ])
}

export function normalizeMagicDifficulty(value: unknown): MagicDifficultyValue | null {
  return pickNormalizedValue(value, [
    ['master', ['master', 'expert', 'legendary', '??', '??', '??', '??', '??']],
    ['advanced', ['advanced', 'high', '??', '??', '??']],
    ['intermediate', ['intermediate', 'medium', 'mid', '??', '??']],
    ['beginner', ['beginner', 'basic', 'novice', '??', '??', '??', '??']],
  ])
}

export function normalizeMagicCastType(value: unknown): MagicCastTypeValue | null {
  return pickNormalizedValue(value, [
    ['instant', ['instant', 'quick', '??', '??', '??']],
    ['channel', ['channel', 'channeled', '????', '??', '????']],
    ['ritual', ['ritual', 'ceremony', '??', '??', '??']],
  ])
}
