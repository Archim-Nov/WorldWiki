import { describe, expect, it } from 'vitest'

import { buildConversationPrompt, buildGenerationPrompt } from '@/lib/writer/prompts/assemble'

describe('writer prompt assembly', () => {
  const schema = {
    documentType: 'magic',
    title: 'Magic',
    titleField: 'name',
    slugField: 'slug',
    bodyField: 'details',
    groups: [],
    fields: [
      {
        name: 'difficulty',
        title: 'Difficulty',
        kind: 'string',
        required: false,
        options: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
        ],
      },
      {
        name: 'details',
        title: 'Details',
        kind: 'portableText',
        required: false,
      },
    ],
  } as const

  it('includes allowed option values in generation prompts', () => {
    const prompt = buildGenerationPrompt({
      schema,
      presets: [],
      sourceText: 'test',
      instruction: 'test',
      currentFields: {},
      conceptCard: undefined,
      outline: undefined,
      selectedOutlineBlocks: undefined,
    })

    expect(prompt.systemPrompt).toContain('allowed values: beginner (Beginner) | intermediate (Intermediate)')
    expect(prompt.systemPrompt).toContain('you must return one of the option.value entries exactly')
  })

  it('includes exact option.value rules in conversation prompts', () => {
    const prompt = buildConversationPrompt({
      session: {
        id: 'session-1',
        title: 'Magic Draft',
        documentType: 'magic',
        presetIds: [],
        createdAt: '2026-03-08T00:00:00.000Z',
        updatedAt: '2026-03-08T00:00:00.000Z',
        status: 'draft',
        messages: [],
        draft: {
          documentType: 'magic',
          sourceText: '',
          fields: {},
          lockedFields: [],
          updatedAt: '2026-03-08T00:00:00.000Z',
        },
      },
      schema,
      presets: [],
      input: '???????',
      intent: 'explore',
      suggestions: [],
    })

    expect(prompt.systemPrompt).toContain('If a field has allowed values in the schema, you must use the exact option.value token only.')
    expect(prompt.systemPrompt).toContain('allowed values: beginner (Beginner) | intermediate (Intermediate)')
  })
})
