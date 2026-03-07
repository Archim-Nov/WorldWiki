'use client'

import { useState } from 'react'
import type { WriterProviderSummary } from '@/types/writer'

export function ProviderManager({ initialProviders }: { initialProviders: WriterProviderSummary[] }) {
  const [providers, setProviders] = useState(initialProviders)
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    kind: 'openai-compatible',
    model: '',
    baseUrl: '',
    apiKey: '',
    command: '',
    argsText: '',
  })

  async function refresh() {
    const response = await fetch('/api/writer/providers')
    const data = await response.json()
    setProviders(Array.isArray(data) ? data : [])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await fetch('/api/writer/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        kind: form.kind,
        model: form.model,
        baseUrl: form.baseUrl,
        apiKey: form.apiKey,
        command: form.command,
        args: form.argsText
          .split(/\s+/g)
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    })

    setForm({
      name: '',
      kind: 'openai-compatible',
      model: '',
      baseUrl: '',
      apiKey: '',
      command: '',
      argsText: '',
    })
    await refresh()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/writer/providers?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    await refresh()
  }

  async function handleTest(id: string) {
    setMessages((current) => ({ ...current, [id]: '测试中...' }))

    const response = await fetch('/api/writer/providers/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId: id }),
    })
    const data = await response.json()

    setMessages((current) => ({
      ...current,
      [id]: data.message ?? (response.ok ? '连接成功' : '连接失败'),
    }))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">已有 Provider</h2>
        <div className="mt-4 space-y-3">
          {providers.length === 0 ? (
            <div className="text-sm text-muted-foreground">尚未配置 Provider。</div>
          ) : (
            providers.map((provider) => (
              <div key={provider.id} className="rounded-xl border border-border px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{provider.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {provider.kind}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDelete(provider.id)} className="text-sm text-destructive">
                    删除
                  </button>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {provider.kind === 'cli'
                    ? `命令：${provider.command ?? '-'} ${provider.args?.join(' ') ?? ''}`
                    : `模型：${provider.model ?? '-'} · ${provider.baseUrl ?? '默认 Base URL'}`}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" onClick={() => handleTest(provider.id)} className="rounded-lg border border-border px-3 py-1 text-xs">
                    测试连接
                  </button>
                  {messages[provider.id] ? (
                    <span className="text-xs text-muted-foreground">{messages[provider.id]}</span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">新增 Provider</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Provider 名称"
          />
          <select
            value={form.kind}
            onChange={(event) => setForm((current) => ({ ...current, kind: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="openai-compatible">OpenAI-compatible</option>
            <option value="cli">CLI</option>
          </select>
          <input
            value={form.model}
            onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="模型名（API Provider）"
          />
          <input
            value={form.baseUrl}
            onChange={(event) => setForm((current) => ({ ...current, baseUrl: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Base URL（可选）"
          />
          <input
            value={form.apiKey}
            onChange={(event) => setForm((current) => ({ ...current, apiKey: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="API Key（本地保存）"
          />
          <input
            value={form.command}
            onChange={(event) => setForm((current) => ({ ...current, command: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="CLI 命令（CLI Provider）"
          />
          <input
            value={form.argsText}
            onChange={(event) => setForm((current) => ({ ...current, argsText: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="CLI 参数，空格分隔"
          />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
            保存 Provider
          </button>
        </form>
      </section>
    </div>
  )
}
