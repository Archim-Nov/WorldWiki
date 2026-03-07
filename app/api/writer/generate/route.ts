import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { getWriterSession, updateWriterSession } from '@/lib/writer/storage/sessions'
import { getProviderInstance } from '@/lib/writer/providers/registry'
import { listPromptPresets } from '@/lib/writer/storage/presets'
import { getWriterSchemaSummary } from '@/lib/writer/schema/introspect'
import { buildGenerationPrompt } from '@/lib/writer/prompts/assemble'
import { createTimestamp, createWriterId } from '@/lib/writer/utils'

function mergeGeneratedFields(args: {
  currentFields: Record<string, unknown>
  generatedFields: Record<string, unknown>
  lockedFields: string[]
  mode: string
}) {
  const nextFields = { ...args.currentFields }

  for (const [fieldName, value] of Object.entries(args.generatedFields)) {
    if (args.lockedFields.includes(fieldName)) continue

    const currentValue = nextFields[fieldName]
    const hasCurrentValue =
      currentValue !== undefined &&
      currentValue !== null &&
      (!(typeof currentValue === 'string') || currentValue.trim().length > 0) &&
      (!Array.isArray(currentValue) || currentValue.length > 0)

    if (args.mode === 'fill-missing' && hasCurrentValue) {
      continue
    }

    nextFields[fieldName] = value
  }

  return nextFields
}

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
  const instruction = typeof body.instruction === 'string' ? body.instruction.trim() : ''
  const mode = body.mode === 'fill-missing' || body.mode === 'rewrite' ? body.mode : 'scaffold'

  if (!sessionId || !instruction) return badRequest('missing_session_or_instruction')

  const session = await getWriterSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const provider = await getProviderInstance(session.providerId)
  if (!provider) {
    return NextResponse.json({ error: 'provider_not_configured' }, { status: 503 })
  }

  const allPresets = await listPromptPresets()
  const presets = allPresets.filter((preset) => session.presetIds.includes(preset.id))
  const schema = getWriterSchemaSummary(session.documentType)
  const prompt = buildGenerationPrompt({
    schema,
    presets,
    sourceText: session.draft.sourceText,
    instruction,
    currentFields: session.draft.fields,
  })

  const result = await provider.generate(prompt)
  const nextFields = mergeGeneratedFields({
    currentFields: session.draft.fields,
    generatedFields: result.fields,
    lockedFields: session.draft.lockedFields,
    mode,
  })

  if (result.title && !session.draft.lockedFields.includes(schema.titleField)) {
    nextFields[schema.titleField] = result.title
  }

  const now = createTimestamp()
  const nextMessages = [
    ...session.messages,
    {
      id: createWriterId('message'),
      role: 'user' as const,
      content: instruction,
      createdAt: now,
    },
    {
      id: createWriterId('message'),
      role: 'assistant' as const,
      content: result.assistantMessage,
      createdAt: now,
    },
  ]

  const nextSession = await updateWriterSession(sessionId, {
    messages: nextMessages,
    draft: {
      ...session.draft,
      fields: nextFields,
    },
  })

  return NextResponse.json({
    session: nextSession,
    result,
  })
}
