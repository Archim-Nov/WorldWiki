'use client'

import { useState } from 'react'
import type { WriterPromptPreset } from '@/types/writer'

export function PresetManager({ initialPresets }: { initialPresets: WriterPromptPreset[] }) {
  const [presets, setPresets] = useState(initialPresets)
  const [form, setForm] = useState({
    name: '',
    scope: 'project',
    documentType: '',
    content: '',
  })

  async function refresh() {
    const response = await fetch('/api/writer/presets')
    const data = await response.json()
    setPresets(Array.isArray(data) ? data : [])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await fetch('/api/writer/presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setForm({
      name: '',
      scope: 'project',
      documentType: '',
      content: '',
    })
    await refresh()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/writer/presets?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    await refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">现有预设</h2>
        <div className="mt-4 space-y-3">
          {presets.length === 0 ? (
            <div className="text-sm text-muted-foreground">尚未保存任何预设。</div>
          ) : (
            presets.map((preset) => (
              <div key={preset.id} className="rounded-xl border border-border px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{preset.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {preset.scope}
                      {preset.documentType ? ` · ${preset.documentType}` : ''}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDelete(preset.id)} className="text-sm text-destructive">
                    删除
                  </button>
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{preset.content}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">新增预设</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="预设名称"
          />
          <select
            value={form.scope}
            onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="project">项目级</option>
            <option value="documentType">类型级</option>
            <option value="task">任务级</option>
          </select>
          <input
            value={form.documentType}
            onChange={(event) => setForm((current) => ({ ...current, documentType: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="条目类型（仅类型级时填写）"
          />
          <textarea
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            className="min-h-48 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
            placeholder="写入世界观规则、文风要求、禁忌设定等..."
          />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
            保存预设
          </button>
        </form>
      </section>
    </div>
  )
}
