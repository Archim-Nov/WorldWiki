import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { getProviderInstance } from '@/lib/writer/providers/registry'
import { buildOutlinePrompt } from '@/lib/writer/prompts/assemble'
import { getWriterSchemaSummary } from '@/lib/writer/schema/introspect'
import { listPromptPresets } from '@/lib/writer/storage/presets'
import { getWriterSession, updateWriterSession } from '@/lib/writer/storage/sessions'
import { createOutlineFromConceptCard, mergeOutlineBlocks } from '@/lib/writer/workflow/conversation'
import { createTimestamp, createWriterId } from '@/lib/writer/utils'

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
  if (!sessionId) return badRequest('missing_session_id')

  const session = await getWriterSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const schema = getWriterSchemaSummary(session.documentType)
  const fallbackOutline = createOutlineFromConceptCard({
    conceptCard: session.conceptCard,
    schema,
  })

  let assistantMessage = '已根据当前概念讨论整理出可继续审核的条目雏形。'
  let nextOutline = fallbackOutline
  let suggestedNextAction: string = 'start-drafting'

  const provider = await getProviderInstance(session.providerId)
  if (provider) {
    try {
      const allPresets = await listPromptPresets()
      const presets = allPresets.filter((preset) => session.presetIds.includes(preset.id))
      const prompt = buildOutlinePrompt({ session, schema, presets })
      const result = await provider.generate(prompt)

      assistantMessage = result.assistantMessage || assistantMessage
      suggestedNextAction = result.suggestedNextAction ?? suggestedNextAction
      nextOutline = mergeOutlineBlocks(session.outline, result.outline, fallbackOutline)
    } catch {
      assistantMessage = 'AI 雏形整理失败，已使用本地规则生成一版可编辑雏形。'
      nextOutline = fallbackOutline
    }
  }

  const now = createTimestamp()
  const nextSession = await updateWriterSession(session.id, {
    workflowMode: 'conversation',
    stage: 'outline',
    outline: nextOutline,
    messages: [
      ...session.messages,
      {
        id: createWriterId('message'),
        role: 'assistant',
        content: assistantMessage,
        createdAt: now,
      },
    ],
  })

  return NextResponse.json({
    session: nextSession,
    outline: nextOutline,
    assistantMessage,
    suggestedNextAction,
  })
}
