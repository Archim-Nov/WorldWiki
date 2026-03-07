'use client'

import { useMemo, useState } from 'react'
import type { WriterPromptPreset, WriterProviderSummary, WriterSchemaSummary, WriterSession } from '@/types/writer'
import { StructuredFieldEditor } from '@/components/writer/StructuredFieldEditor'
import { ChecksPanel } from '@/components/writer/ChecksPanel'

type WriterWorkbenchProps = {
  initialSession: WriterSession
  schema: WriterSchemaSummary
  providers: WriterProviderSummary[]
  presets: WriterPromptPreset[]
}

export function WriterWorkbench({ initialSession, schema, providers, presets }: WriterWorkbenchProps) {
  const [session, setSession] = useState(initialSession)
  const [instruction, setInstruction] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const [flashMessage, setFlashMessage] = useState('')

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

  async function handleSave() {
    setBusyAction('save')
    const { response, data } = await patchSession({
      title: session.title,
      providerId: session.providerId,
      presetIds: session.presetIds,
      draft: session.draft,
    })

    setFlashMessage(response.ok ? '草稿已保存。' : data.error ?? '保存失败')
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

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr_0.9fr]">
      <aside className="space-y-5">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Session</div>
          <h1 className="mt-3 text-2xl font-semibold">{session.title}</h1>
          <div className="mt-2 text-sm text-muted-foreground">{schema.title} · {session.status}</div>

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
                className="min-h-32 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">启用预设</label>
              <div className="space-y-2 rounded-xl border border-border p-3">
                {availablePresets.length === 0 ? (
                  <div className="text-sm text-muted-foreground">暂无可用预设。</div>
                ) : (
                  availablePresets.map((preset) => {
                    const checked = session.presetIds.includes(preset.id)
                    return (
                      <label key={preset.id} className="flex items-start gap-3 text-sm">
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
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">AI 操作</h2>
          <textarea
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            className="mt-4 min-h-32 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
            placeholder="例如：补全 summary 和 customs，保持简洁的百科风格，不要修改 slug。"
          />
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => handleGenerate('scaffold')}
              disabled={busyAction !== ''}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
            >
              AI 生成草稿
            </button>
            <button
              type="button"
              onClick={() => handleGenerate('fill-missing')}
              disabled={busyAction !== ''}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
            >
              只补空字段
            </button>
            <button
              type="button"
              onClick={() => handleGenerate('rewrite')}
              disabled={busyAction !== ''}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
            >
              局部重写
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">会话记录</h2>
          <div className="mt-4 space-y-3">
            {session.messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">还没有 AI 对话记录。</div>
            ) : (
              session.messages.map((message) => (
                <div key={message.id} className="rounded-xl border border-border px-3 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{message.role}</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm">{message.content}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </aside>

      <div className="space-y-5">
        {flashMessage ? (
          <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">{flashMessage}</div>
        ) : null}

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

      <ChecksPanel result={session.lastCheck} />
    </div>
  )
}
