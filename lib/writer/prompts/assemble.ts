import type {
  WriterConversationIntent,
  WriterDocumentType,
  WriterOutlineBlock,
  WriterPromptPreset,
  WriterSchemaSummary,
  WriterSession,
  WriterTypeSuggestion,
} from '@/types/writer'

function formatSchema(schema: WriterSchemaSummary) {
  return schema.fields
    .map((field) => {
      const extra = [field.required ? 'required' : null, field.description ?? null].filter(Boolean).join(', ')
      return `- ${field.name} (${field.kind}${extra ? `, ${extra}` : ''})`
    })
    .join('\n')
}

function formatSchemaGroups(schema: WriterSchemaSummary) {
  if (schema.groups.length === 0) return 'No schema groups.'

  return schema.groups.map((group) => `- ${group.title}: ${group.fieldNames.join(', ')}`).join('\n')
}

function formatPresets(presets: WriterPromptPreset[]) {
  const enabledPresets = presets.filter((preset) => preset.enabled)
  if (enabledPresets.length === 0) return 'No extra presets enabled.'

  return enabledPresets.map((preset) => `## ${preset.name}\n${preset.content}`).join('\n\n')
}

function formatSuggestions(suggestions: WriterTypeSuggestion[]) {
  if (suggestions.length === 0) return 'No type suggestions yet.'

  return suggestions
    .map((suggestion) => `- ${suggestion.documentType} (score: ${suggestion.score.toFixed(2)}) ${suggestion.reason}`)
    .join('\n')
}

function formatRecentMessages(session: WriterSession) {
  if (session.messages.length === 0) return 'No prior messages.'

  return session.messages
    .slice(-8)
    .map((message) => `[${message.role}] ${message.content}`)
    .join('\n\n')
}

function formatOutline(session: WriterSession) {
  if (!session.outline || session.outline.length === 0) return 'No outline yet.'

  return session.outline
    .map((block) => `- ${block.title} [${block.status}] => ${block.summary} (fields: ${block.mappedFields.join(', ')})`)
    .join('\n')
}

function formatSelectedOutlineBlocks(blocks?: WriterOutlineBlock[]) {
  if (!blocks || blocks.length === 0) return 'No specific outline blocks selected.'

  return blocks
    .map((block) => `- ${block.title}: ${block.summary} (fields: ${block.mappedFields.join(', ')})`)
    .join('\n')
}

export function buildClassificationPrompt(text: string, documentTypes: WriterDocumentType[]) {
  return [
    'Classify the following worldbuilding note into the most suitable entry type.',
    `Allowed types: ${documentTypes.join(', ')}`,
    '',
    text,
  ].join('\n')
}

export function buildGenerationPrompt(args: {
  schema: WriterSchemaSummary
  presets: WriterPromptPreset[]
  sourceText: string
  instruction: string
  currentFields: Record<string, unknown>
  conceptCard?: WriterSession['conceptCard']
  outline?: WriterSession['outline']
  selectedOutlineBlocks?: WriterOutlineBlock[]
}) {
  const { schema, presets, sourceText, instruction, currentFields, conceptCard, outline, selectedOutlineBlocks } = args

  const systemPrompt = [
    'You are a structured worldbuilding entry assistant.',
    'Return JSON only.',
    'Use this shape: {"assistantMessage": string, "title": string?, "fields": Record<string, unknown>}.',
    'Only fill fields that exist in the schema.',
    'For rich text fields, return plain paragraph text; the app will convert it later.',
    `Current document type: ${schema.documentType}`,
    'Schema fields:',
    formatSchema(schema),
    'Schema groups:',
    formatSchemaGroups(schema),
    'Active presets:',
    formatPresets(presets),
  ].join('\n\n')

  const userPrompt = [
    `Source material:\n${sourceText || '(empty)'}`,
    `Current concept card:\n${JSON.stringify(conceptCard ?? null, null, 2)}`,
    `Current outline:\n${JSON.stringify(outline ?? null, null, 2)}`,
    `Selected outline blocks:\n${formatSelectedOutlineBlocks(selectedOutlineBlocks)}`,
    `Current fields:\n${JSON.stringify(currentFields, null, 2)}`,
    `Instruction:\n${instruction}`,
  ].join('\n\n')

  return { systemPrompt, userPrompt }
}

export function buildConversationPrompt(args: {
  session: WriterSession
  presets: WriterPromptPreset[]
  input: string
  intent: WriterConversationIntent
  suggestions: WriterTypeSuggestion[]
}) {
  const { session, presets, input, intent, suggestions } = args

  const systemPrompt = [
    'You are a collaborative worldbuilding partner helping the user talk through an idea before drafting a full entry.',
    'Stay discussion-first: clarify intent, preserve established decisions, and do not rush into final prose.',
    'Respond in Chinese.',
    'Return JSON only.',
    'Use this shape:',
    '{',
    '  "assistantMessage": string,',
    '  "conceptCard": {',
    '    "premise": string,',
    '    "tone": string?,',
    '    "goals": string[],',
    '    "constraints": string[],',
    '    "candidateTypes": Array<{"documentType": string, "score": number, "reason": string}>,',
    '    "openQuestions": string[],',
    '    "decisions": Array<{"label": string, "value": string, "locked": boolean?, "source": "assistant" | "user"}>',
    '  },',
    '  "suggestedNextAction": "continue-conversation" | "create-outline" | "start-drafting" | "run-calibration" | "submit",',
    '  "fields": {}',
    '}',
    'Keep the concept card concise and stable. Preserve previous locked or confirmed decisions when possible.',
    'Prefer 1-3 sharp follow-up questions instead of a huge answer when information is missing.',
    'Active presets:',
    formatPresets(presets),
  ].join('\n\n')

  const userPrompt = [
    `Session title: ${session.title}`,
    `Current document type: ${session.documentType}`,
    `Workflow stage: ${session.stage ?? 'conversation'}`,
    `Initial concept brief:\n${session.draft.sourceText || '(empty)'}`,
    `Current concept card:\n${JSON.stringify(session.conceptCard ?? null, null, 2)}`,
    `Candidate types:\n${formatSuggestions(suggestions)}`,
    `Recent conversation:\n${formatRecentMessages(session)}`,
    `User intent: ${intent}`,
    `Latest user message:\n${input}`,
    'Help the user converge on a solid concept card that can later become a structured entry draft.',
  ].join('\n\n')

  return { systemPrompt, userPrompt }
}

export function buildOutlinePrompt(args: {
  session: WriterSession
  schema: WriterSchemaSummary
  presets: WriterPromptPreset[]
}) {
  const { session, schema, presets } = args

  const systemPrompt = [
    'You are a worldbuilding outlining assistant.',
    'Turn the current concept discussion into a concise entry outline before full drafting begins.',
    'Respond in Chinese.',
    'Return JSON only.',
    'Use this shape:',
    '{',
    '  "assistantMessage": string,',
    '  "outline": Array<{',
    '    "title": string,',
    '    "summary": string,',
    '    "mappedFields": string[],',
    '    "status": "pending" | "accepted" | "expanded"',
    '  }>,',
    '  "suggestedNextAction": "create-outline" | "start-drafting" | "continue-conversation",',
    '  "fields": {}',
    '}',
    'The outline should be practical, field-aware, and avoid full prose paragraphs.',
    'Each block should map to fields that exist in the schema.',
    'Prefer 3-5 blocks.',
    'Schema groups:',
    formatSchemaGroups(schema),
    'Schema fields:',
    formatSchema(schema),
    'Active presets:',
    formatPresets(presets),
  ].join('\n\n')

  const userPrompt = [
    `Session title: ${session.title}`,
    `Document type: ${session.documentType}`,
    `Source material:\n${session.draft.sourceText || '(empty)'}`,
    `Current concept card:\n${JSON.stringify(session.conceptCard ?? null, null, 2)}`,
    `Recent conversation:\n${formatRecentMessages(session)}`,
    `Existing outline:\n${formatOutline(session)}`,
    'Please produce an outline that the user can review before structured drafting.',
  ].join('\n\n')

  return { systemPrompt, userPrompt }
}
