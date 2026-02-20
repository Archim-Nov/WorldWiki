'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations('ContactPage')
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
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('eyebrow')}</p>
        <h1 className="text-3xl font-semibold mt-4">{t('title')}</h1>
        <p className="text-muted-foreground mt-3">{t('description')}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">{t('name')}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-md px-3 py-2 bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-md px-3 py-2 bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('message')}</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border rounded-md px-3 py-2 bg-background"
              rows={4}
              required
            />
          </div>
          {status === 'success' && <p className="text-green-600">{t('success')}</p>}
          {status === 'error' && <p className="text-red-600">{t('error')}</p>}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md"
          >
            {status === 'loading' ? t('submitting') : t('submit')}
          </button>
        </form>

        <aside className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('notesTitle')}</p>
            <p className="mt-3">{t('notesBody')}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('tipsTitle')}</p>
            <p className="mt-2">{t('tipsBody')}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
