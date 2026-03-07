import type { PortableTextBlock } from 'next-sanity'

function createSpan(text: string) {
  return {
    _type: 'span' as const,
    _key: `span_${Math.random().toString(36).slice(2, 8)}`,
    text,
    marks: [],
  }
}

function createBlock(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: `block_${Math.random().toString(36).slice(2, 8)}`,
    style: 'normal',
    markDefs: [],
    children: [createSpan(text)],
  }
}

export function plainTextToPortableText(value: unknown) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return [] as PortableTextBlock[]
  }

  return value
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(createBlock)
}

export function portableTextToPlainText(value: unknown) {
  if (!Array.isArray(value)) return ''

  return value
    .map((block) => {
      if (!block || typeof block !== 'object' || !('children' in block)) return ''
      const children = (block as { children?: Array<{ text?: string }> }).children ?? []
      return children.map((child) => child.text ?? '').join('')
    })
    .filter(Boolean)
    .join('\n\n')
}
