'use client'

import { useMemo, useState } from 'react'
import type {
  WriterConversationIntent,
  WriterPromptPreset,
  WriterProviderSummary,
  WriterSchemaSummary,
  WriterSession,
  WriterStage,
} from '@/types/writer'
import { StructuredFieldEditor } from '@/components/writer/StructuredFieldEditor'
import { ChecksPanel } from '@/components/writer/ChecksPanel'
import { ConceptCardPanel } from '@/components/writer/ConceptCardPanel'
import { ConversationTimeline } from '@/components/writer/ConversationTimeline'
import { OutlinePanel } from '@/components/writer/OutlinePanel'
import { createConceptCard, getWriterStageLabel } from '@/lib/writer/workflow/conversation'

type WriterWorkbenchProps = {
  initialSession: WriterSession
  schema: WriterSchemaSummary
  providers: WriterProviderSummary[]
  presets: WriterPromptPreset[]
}

const conversationStages: WriterStage[] = ['conversation', 'outline', 'drafting', 'review', 'submitted']

export function WriterWorkbench({ initialSession, schema, providers, presets }: WriterWorkbenchProps) {
  const [session, setSession] = useState(initialSession)
  const [instruction, setInstruction] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const [flashMessage, setFlashMessage] = useState('')

  const workflowMode = session.workflowMode ?? 'direct'
  const stage = session.stage ?? (workflowMode === 'conversation' ? 'conversation' : 'drafting')

  const availablePresets = useMemo(
    () => presets.filter((preset) => preset.scope !== 'documentType' || preset.documentType === session.documentType),
    [presets, session.documentType]
  )

  async function patchSession(payload: Record<string, unknown>) {
    const response = await fetch(`/api/writer/sessions/${session.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (response.ok) {
      setSession(data)
    }

    return { response, data }
  }

  function handleFieldChange(fieldName: string, value: unknown) {
    setSession((current) => ({
      ...current,
      draft: {
        ...current.draft,
        fields: {
          ...current.draft.fields,
          [fieldName]: value,
        },
      },
    }))
  }

  function handleToggleLock(fieldName: string) {
    setSession((current) => {
      const isLocked = current.draft.lockedFields.includes(fieldName)
      return {
        ...current,
        draft: {
          ...current.draft,
          lockedFields: isLocked
            ? current.draft.lockedFields.filter((name) => name !== fieldName)
            : [...current.draft.lockedFields, fieldName],
        },
      }
    })
  }

  function handleToggleDecisionLock(decisionId: string) {
    setSession((current) => ({
      ...current,
      conceptCard: current.conceptCard
        ? {
            ...current.conceptCard,
            decisions: current.conceptCard.decisions.map((decision) =>
              decision.id === decisionId ? { ...decision, locked: !decision.locked } : decision
            ),
          }
        : current.conceptCard,
    }))
  }

  function handleToggleOutlineStatus(blockId: string) {
    setSession((current) => ({
      ...current,
      outline:
        current.outline?.map((block) =>
          block.id === blockId
            ? {
                ...block,
                status: block.status === 'pending' ? 'accepted' : block.status === 'accepted' ? 'expanded' : 'pending',
              }
            : block
        ) ?? current.outline,
    }))
  }

  async function handleSave() {
    setBusyAction('save')
    const { response, data } = await patchSession({
      title: session.title,
      providerId: session.providerId,
      presetIds: session.presetIds,
      workflowMode,
      stage,
      draft: session.draft,
      conceptCard: session.conceptCard,
      outline: session.outline,
    })

    setFlashMessage(response.ok ? '本地草稿已保存。' : data.error ?? '保存失败')
    setBusyAction('')
  }

  async function handleCheck() {
    setBusyAction('check')
    const response = await fetch('/api/writer/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: session.id }),
    })
    const data = await response.json()
    if (response.ok && data.session) {
      setSession(data.session)
      setFlashMessage('校验完成。')
    } else {
      setFlashMessage(data.error ?? '校验失败')
    }
    setBusyAction('')
  }

  async function handleGenerate(mode: 'scaffold' | 'rewrite' | 'fill-missing') {
    if (!instruction.trim()) return

    setBusyAction('generate')
    const response = await fetch('/api/writer/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session.id,
        instruction,
        mode,
      }),
    })
    const data = await response.json()
    if (response.ok && data.session) {
      setSession(data.session)
      setInstruction('')
      setFlashMessage('AI 结果已应用到草稿。')
    } else {
      setFlashMessage(data.error ?? '生成失败')
    }
    setBusyAction('')
  }

  async function handleChat(intent: WriterConversationIntent) {
    if (!chatInput.trim()) return

    setBusyAction('chat')
    const response = await fetch('/api/writer/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session.id,
        input: chatInput,
        intent,
      }),
    })

    const data = await response.json()
    if (response.ok && data.session) {
      setSession(data.session)
      setChatInput('')
      setFlashMessage('AI 已更新概念对话与意图卡。')
    } else {
      setFlashMessage(data.error ?? '对话失败')
    }

    setBusyAction('')
  }

  async function handleCreateOutline() {
    setBusyAction('outline')
    const response = await fetch('/api/writer/outline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session.id,
      }),
    })

    const data = await response.json()
    if (response.ok && data.session) {
      setSession(data.session)
      setFlashMessage(data.assistantMessage ?? '已整理出条目雏形。')
    } else {
      setFlashMessage(data.error ?? '整理雏形失败')
    }

    setBusyAction('')
  }

  async function handleEnableConversation() {
    const conceptCard =
      session.conceptCard ??
      createConceptCard({
        title: session.title,
        sourceText: session.draft.sourceText,
        documentType: session.documentType,
      })

    setBusyAction('stage')
    const { response, data } = await patchSession({
      workflowMode: 'conversation',
      stage: 'conversation',
      conceptCard,
      outline: session.outline,
    })
    setFlashMessage(response.ok ? '已切换为对话式创作。' : data.error ?? '切换失败')
    setBusyAction('')
  }

  async function handleStageChange(nextStage: WriterStage) {
    if (nextStage === 'outline' && (!session.outline || session.outline.length === 0)) {
      await handleCreateOutline()
      return
    }

    setBusyAction('stage')
    const { response, data } = await patchSession({
      stage: nextStage,
      workflowMode,
      conceptCard: session.conceptCard,
      outline: session.outline,
    })
    setFlashMessage(response.ok ? `已切换到${getWriterStageLabel(nextStage)}。` : data.error ?? '阶段切换失败')
    setBusyAction('')
  }

  async function handleSubmit(action: 'saveDraft' | 'publish') {
    setBusyAction('submit')
    const response = await fetch('/api/writer/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session.id,
        action,
      }),
    })
    const data = await response.json()
    if (response.ok && data.session) {
      setSession(data.session)
      setFlashMessage(action === 'publish' ? '已发布到 Sanity。' : '已保存到 Sanity draft。')
    } else {
      setFlashMessage(data.error ?? '提交失败')
    }
    setBusyAction('')
  }

  function getDraftSuggestion() {
    const acceptedBlocks = session.outline?.filter((block) => block.status !== 'pending') ?? []
    if (acceptedBlocks.length === 0) {
      return '根据当前意图卡生成完整字段草稿，并优先覆盖核心设定与正文。'
    }

    return `根据已确认雏形生成字段草稿，优先展开：${acceptedBlocks.map((block) => block.title).join('、')}。`
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Session</div>
            <h1 className="mt-3 text-2xl font-semibold">{session.title}</h1>
            <div className="mt-2 text-sm text-muted-foreground">
              {schema.title} · {session.status} · {workflowMode === 'conversation' ? '对话式创作' : '直达式起草'}
            </div>
          </div>
          {workflowMode === 'conversation' ? (
            <div className="flex flex-wrap gap-2">
              {conversationStages.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleStageChange(item)}
                  disabled={busyAction !== ''}
                  className={`rounded-full px-3 py-1 text-xs ${stage === item ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'}`}
                >
                  {getWriterStageLabel(item)}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEnableConversation}
              disabled={busyAction !== ''}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
            >
              切换为对话式创作
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr_0.9fr]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">会话设置</h2>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">当前 Provider</label>
                <select
                  value={session.providerId ?? ''}
                  onChange={(event) => setSession((current) => ({ ...current, providerId: event.target.value || undefined }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">不指定</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">创作简介</label>
                <textarea
                  value={session.draft.sourceText}
                  onChange={(event) =>
                    setSession((current) => ({
                      ...current,
                      draft: {
                        ...current.draft,
                        sourceText: event.target.value,
                      },
                    }))
                  }
                  className="min-h-36 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
                  placeholder="补充你的世界观基础、条目目标或必须遵循的设定。"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">启用预设</div>
                <div className="space-y-2">
                  {availablePresets.map((preset) => {
                    const checked = session.presetIds.includes(preset.id)
                    return (
                      <label key={preset.id} className="flex items-start gap-3 rounded-xl border border-border px-3 py-3 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSession((current) => ({
                              ...current,
                              presetIds: event.target.checked
                                ? [...current.presetIds, preset.id]
                                : current.presetIds.filter((id) => id !== preset.id),
                            }))
                          }
                          className="mt-0.5"
                        />
                        <span>
                          <span className="font-medium">{preset.name}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">{preset.scope}</span>
                        </span>
                      </label>
                    )
                  })}
                  {availablePresets.length === 0 ? <div className="text-sm text-muted-foreground">当前没有可用预设。</div> : null}
                </div>
              </div>
            </div>
          </section>

          {workflowMode === 'conversation' ? (
            <ConceptCardPanel conceptCard={session.conceptCard} onToggleDecisionLock={handleToggleDecisionLock} />
          ) : null}
        </aside>

        <div className="space-y-5">
          {flashMessage ? (
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">{flashMessage}</div>
          ) : null}

          {workflowMode === 'conversation' ? (
            <ConversationTimeline
              messages={session.messages}
              value={chatInput}
              disabled={busyAction !== ''}
              onChange={setChatInput}
              onSend={handleChat}
              onStartDrafting={() => handleStageChange('drafting')}
            />
          ) : null}

          {workflowMode === 'conversation' && stage === 'conversation' ? (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">下一步建议</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                当意图卡中的核心前提、候选类型和关键决定已经比较稳定时，可以先整理出一版条目雏形，再决定如何展开正文与字段。
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCreateOutline}
                  disabled={busyAction !== ''}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
                >
                  整理为条目雏形
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={busyAction !== ''}
                  className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
                >
                  先保存当前对话
                </button>
              </div>
            </section>
          ) : null}

          {workflowMode === 'conversation' && stage === 'outline' ? (
            <OutlinePanel
              outline={session.outline}
              disabled={busyAction !== ''}
              onToggleStatus={handleToggleOutlineStatus}
              onRefresh={handleCreateOutline}
              onStartDrafting={() => handleStageChange('drafting')}
            />
          ) : null}

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">AI 结构化起草</h2>
            <textarea
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              className="mt-4 min-h-32 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
              placeholder={workflowMode === 'conversation' ? getDraftSuggestion() : '例如：补全 summary 和 customs，保持百科式描述，不修改 slug。'}
            />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => handleGenerate('scaffold')}
                disabled={busyAction !== '' || !instruction.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                生成字段草稿
              </button>
              <button
                type="button"
                onClick={() => handleGenerate('fill-missing')}
                disabled={busyAction !== '' || !instruction.trim()}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
              >
                只补空字段
              </button>
              <button
                type="button"
                onClick={() => handleGenerate('rewrite')}
                disabled={busyAction !== '' || !instruction.trim()}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
              >
                重写当前部分
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={busyAction !== ''}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
              >
                保存本地草稿
              </button>
              <button
                type="button"
                onClick={handleCheck}
                disabled={busyAction !== ''}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
              >
                运行校验
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('saveDraft')}
                disabled={busyAction !== ''}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                提交到 Sanity Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('publish')}
                disabled={busyAction !== ''}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
              >
                直接发布
              </button>
            </div>
          </section>

          <StructuredFieldEditor
            schema={schema}
            fields={session.draft.fields}
            lockedFields={session.draft.lockedFields}
            onFieldChange={handleFieldChange}
            onToggleLock={handleToggleLock}
          />
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">当前状态</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">阶段</span>
                <span>{getWriterStageLabel(stage)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">消息数</span>
                <span>{session.messages.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">雏形块数</span>
                <span>{session.outline?.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">锁定字段</span>
                <span>{session.draft.lockedFields.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">最后更新</span>
                <span>{new Date(session.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </section>

          <ChecksPanel result={session.lastCheck} />
        </aside>
      </div>
    </div>
  )
}

