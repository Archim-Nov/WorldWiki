'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } else {
      setStatus('error')
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <header className="max-w-2xl mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Contact
        </p>
        <h1 className="text-3xl font-semibold mt-4">联系我们</h1>
        <p className="text-muted-foreground mt-3">
          任何建议、合作或世界观补充，都欢迎在这里留下信息。
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-6 space-y-4"
        >
          <div>
            <label className="block text-sm mb-1">姓名</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-md px-3 py-2 bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">邮箱</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-md px-3 py-2 bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">消息</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border rounded-md px-3 py-2 bg-background"
              rows={4}
              required
            />
          </div>
          {status === 'success' && (
            <p className="text-green-600">提交成功，我们会尽快回复。</p>
          )}
          {status === 'error' && (
            <p className="text-red-600">提交失败，请稍后再试。</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md"
          >
            {status === 'loading' ? '提交中...' : '提交'}
          </button>
        </form>

        <aside className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Museum Notes
            </p>
            <p className="mt-3">
              如果你有角色设定或世界观素材，欢迎联系我们一起完善宇宙。
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">联系建议</p>
            <p className="mt-2">
              留下清晰的主题与背景，便于我们将内容融入到故事线中。
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
