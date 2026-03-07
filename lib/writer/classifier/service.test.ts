import { describe, expect, it } from 'vitest'
import { classifyWriterType } from '@/lib/writer/classifier/service'

describe('classifyWriterType', () => {
  it('prefers country for nation-like text', async () => {
    const result = await classifyWriterType('这是一个高山王国，拥有自己的首都和政体。')
    expect(result[0]?.documentType).toBe('country')
  })

  it('prefers magic for spell-like text', async () => {
    const result = await classifyWriterType('一个火元素法术，需要仪式与咒语才能释放。')
    expect(result[0]?.documentType).toBe('magic')
  })
})
