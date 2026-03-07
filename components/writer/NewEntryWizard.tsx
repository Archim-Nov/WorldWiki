'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import type { WriterProviderSummary, WriterSchemaSummary, WriterTypeSuggestion, WriterWorkflowMode } from '@/types/writer'
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
  const [workflowMode, setWorkflowMode] = useState<WriterWorkflowMode>('conversation')
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
          providerId,
          workflowMode,
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

  async function handleImport(lookup = importLookup, type = importType) {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/writer/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lookup,
          documentType: type,
          providerId,
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
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Writer V1.1</p>
          <h1 className="mt-3 text-3xl font-semibold">先对话，再成稿</h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            先用自然语言讨论概念，再由 AI 帮你收束条目类型与核心设定，最后进入结构化起草。
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setWorkflowMode('conversation')}
              className={`rounded-2xl border p-5 text-left transition ${workflowMode === 'conversation' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}
            >
              <div className="text-base font-semibold">对话式创作</div>
              <p className="mt-2 text-sm text-muted-foreground">推荐。先和 AI 讨论概念、边界与风格，再沉淀成条目意图卡。</p>
            </button>
            <button
              type="button"
              onClick={() => setWorkflowMode('direct')}
              className={`rounded-2xl border p-5 text-left transition ${workflowMode === 'direct' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}
            >
              <div className="text-base font-semibold">直达式起草</div>
              <p className="mt-2 text-sm text-muted-foreground">沿用现有 Writer 工作流，直接根据简介与指令生成结构化草稿。</p>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">新建条目</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">条目标题</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="例如：潮汐同盟"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">概念简介 / 创作简述</label>
              <textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                className="min-h-40 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
                placeholder="先写下你想讨论的核心概念、风格、已有设定或疑问。"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">初始条目类型</label>
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
                  <option value="">不指定</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleClassify}
                disabled={loading || !sourceText.trim()}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
              >
                {loading ? '分析中...' : '判断条目类型'}
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                {loading ? '创建中...' : workflowMode === 'conversation' ? '创建对话式会话' : '创建直达式会话'}
              </button>
            </div>

            {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">类型建议</h2>
          <p className="mt-2 text-sm text-muted-foreground">根据你的简介，Writer 会推荐最接近的条目类型。</p>
          {suggestions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
              点击“判断条目类型”后，这里会显示候选类型与判断依据。
            </div>
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
                    <div className="text-xs text-muted-foreground">score {suggestion.score.toFixed(2)}</div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{suggestion.reason}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">导入现有条目</h2>
          <p className="mt-2 text-sm text-muted-foreground">如果想基于 Sanity 中已有条目继续创作，可以直接导入到 Writer。</p>

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
