'use client'

import type { WriterConversationIntent, WriterMessage } from '@/types/writer'

type ConversationTimelineProps = {
  messages: WriterMessage[]
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onSend: (intent: WriterConversationIntent) => Promise<void>
  onStartDrafting?: () => Promise<void>
}

export function ConversationTimeline({ messages, value, disabled, onChange, onSend, onStartDrafting }: ConversationTimelineProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">概念对话</h2>
          <p className="mt-1 text-sm text-muted-foreground">先和 AI 讨论设定，再逐步收束成条目雏形。</p>
        </div>
        {onStartDrafting ? (
          <button
            type="button"
            onClick={() => onStartDrafting()}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
            disabled={disabled}
          >
            进入结构化起草
          </button>
        ) : null}
      </div>

      <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
            还没有对话记录。你可以先描述概念、风格、设定边界，AI 会帮助你持续梳理。
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="rounded-xl border border-border px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{message.role}</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.content}</div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 space-y-3">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-32 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm"
          placeholder="例如：我想先讨论一个海上贸易国家，它依靠潮汐魔法维持远航和港口秩序。"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onSend('explore')}
            disabled={disabled || !value.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
          >
            继续讨论
          </button>
          <button
            type="button"
            onClick={() => onSend('refine')}
            disabled={disabled || !value.trim()}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
          >
            收束设定
          </button>
          <button
            type="button"
            onClick={() => onSend('resolve')}
            disabled={disabled || !value.trim()}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
          >
            解决冲突
          </button>
        </div>
      </div>
    </section>
  )
}
