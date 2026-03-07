'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import type { WriterProviderSummary, WriterSchemaSummary, WriterTypeSuggestion } from '@/types/writer'
import { withLocalePrefix } from '@/i18n/path'
import { defaultLocale, isValidLocale } from '@/i18n/routing'
import { ExistingEntryPicker } from '@/components/writer/ExistingEntryPicker'

type NewEntryWizardProps = {
  schemas: WriterSchemaSummary[]
  providers: WriterProviderSummary[]
}

export function NewEntryWizard({ schemas, providers }: NewEntryWizardProps) {
  const router = useRouter()
  const locale = useLocale()
  const activeLocale = isValidLocale(locale) ? locale : defaultLocale
  const [title, setTitle] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [documentType, setDocumentType] = useState(schemas[0]?.documentType ?? 'country')
  const [providerId, setProviderId] = useState(providers[0]?.id ?? '')
  const [importLookup, setImportLookup] = useState('')
  const [importType, setImportType] = useState(schemas[0]?.documentType ?? 'country')
  const [suggestions, setSuggestions] = useState<WriterTypeSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const schemaLabelMap = useMemo(
    () => new Map(schemas.map((schema) => [schema.documentType, schema.title])),
    [schemas]
  )

  async function handleClassify() {
    if (!sourceText.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/writer/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: sourceText }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? '分类失败')
        return
      }

      setSuggestions(data)
      if (data[0]?.documentType) {
        setDocumentType(data[0].documentType)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/writer/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          sourceText,
          documentType,
          providerId: providerId || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? '创建失败')
        return
      }

      router.push(withLocalePrefix(`/writer/${data.id}`, activeLocale))
    } finally {
      setLoading(false)
    }
  }

  async function handleImport(lookup = importLookup, nextDocumentType = importType) {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/writer/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: nextDocumentType,
          lookup,
          providerId: providerId || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? '导入失败')
        return
      }

      router.push(withLocalePrefix(`/writer/${data.id}`, activeLocale))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">新建条目</h1>
        <p className="mt-2 text-sm text-muted-foreground">先输入你的创作需求，Writer 会帮你识别条目类型并创建结构化草稿。</p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">暂定标题</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="例如：北境星辉王国"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">创作简介</label>
            <textarea
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              className="min-h-48 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
              placeholder="描述你想创建的条目：背景、风格、设定、关键要素……"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">条目类型</label>
              <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value as typeof documentType)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {schemas.map((schema) => (
                  <option key={schema.documentType} value={schema.documentType}>
                    {schema.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">AI Provider</label>
              <select
                value={providerId}
                onChange={(event) => setProviderId(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">暂不指定</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleClassify}
              disabled={loading || !sourceText.trim()}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
            >
              {loading ? '分析中...' : '智能识别类型'}
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !sourceText.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
            >
              {loading ? '创建中...' : '创建会话'}
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">识别结果</h2>
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">点击“智能识别类型”后，这里会展示候选条目类型与原因。</p>
          ) : (
            <div className="mt-4 space-y-3">
              {suggestions.slice(0, 4).map((suggestion) => (
                <button
                  type="button"
                  key={suggestion.documentType}
                  onClick={() => setDocumentType(suggestion.documentType)}
                  className="block w-full rounded-xl border border-border p-4 text-left transition hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{schemaLabelMap.get(suggestion.documentType) ?? suggestion.documentType}</div>
                    <div className="text-xs text-muted-foreground">score {suggestion.score}</div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{suggestion.reason}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">导入现有条目</h2>
          <p className="mt-2 text-sm text-muted-foreground">输入条目类型和 `slug` 或文档 `_id`，即可把现有 Sanity 内容导入到 Writer 继续编辑。</p>

          <div className="mt-4 space-y-4">
            <ExistingEntryPicker
              schemas={schemas}
              selectedType={importType}
              onSelectType={setImportType}
              onImport={handleImport}
              disabled={loading}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug 或文档 ID</label>
              <input
                value={importLookup}
                onChange={(event) => setImportLookup(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="例如：north-kingdom 或 country-north-kingdom"
              />
            </div>

            <button
              type="button"
              onClick={() => handleImport()}
              disabled={loading || !importLookup.trim()}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
            >
              {loading ? '导入中...' : '导入到 Writer'}
            </button>
          </div>
        </section>
      </aside>
    </div>
  )
}
