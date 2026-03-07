import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { classifyWriterType } from '@/lib/writer/classifier/service'
import { getProviderInstance } from '@/lib/writer/providers/registry'
import { buildConversationPrompt } from '@/lib/writer/prompts/assemble'
import { getWriterSession, updateWriterSession } from '@/lib/writer/storage/sessions'
import { listPromptPresets } from '@/lib/writer/storage/presets'
import { mergeConceptCard, createConceptCard } from '@/lib/writer/workflow/conversation'
import { createTimestamp, createWriterId } from '@/lib/writer/utils'

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
  const input = typeof body.input === 'string' ? body.input.trim() : ''
  const intent = body.intent === 'refine' || body.intent === 'resolve' ? body.intent : 'explore'

  if (!sessionId || !input) {
    return badRequest('missing_session_or_input')
  }

  const session = await getWriterSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const provider = await getProviderInstance(session.providerId)
  if (!provider) {
    return NextResponse.json({ error: 'provider_not_configured' }, { status: 503 })
  }

  const suggestions = await classifyWriterType([session.title, session.draft.sourceText, input].filter(Boolean).join('\n'))
  const allPresets = await listPromptPresets()
  const presets = allPresets.filter((preset) => session.presetIds.includes(preset.id))
  const prompt = buildConversationPrompt({
    session,
    presets,
    input,
    intent,
    suggestions,
  })

  const result = await provider.generate(prompt)
  const baseConceptCard = session.conceptCard ??
    createConceptCard({
      title: session.title,
      sourceText: session.draft.sourceText,
      documentType: session.documentType,
      suggestions,
    })
  const nextConceptCard = mergeConceptCard(baseConceptCard, result.conceptCard, suggestions)
  const now = createTimestamp()
  const nextMessages = [
    ...session.messages,
    {
      id: createWriterId('message'),
      role: 'user' as const,
      content: input,
      createdAt: now,
    },
    {
      id: createWriterId('message'),
      role: 'assistant' as const,
      content: result.assistantMessage,
      createdAt: now,
    },
  ]

  const nextSession = await updateWriterSession(session.id, {
    title: result.title?.trim() ? result.title.trim() : session.title,
    workflowMode: 'conversation',
    stage: 'conversation',
    messages: nextMessages,
    conceptCard: nextConceptCard,
  })

  return NextResponse.json({
    session: nextSession,
    reply: result.assistantMessage,
    conceptCard: nextConceptCard,
    suggestedNextAction: result.suggestedNextAction ?? 'continue-conversation',
  })
}
