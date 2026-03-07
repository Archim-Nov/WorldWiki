export function createTimestamp() {
  return new Date().toISOString()
}

export function createWriterId(prefix = 'writer') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function slugifyText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value
  if (value === null || value === undefined) return []
  return [value]
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
