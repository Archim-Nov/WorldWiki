'use client'

import type { WriterOutlineBlock } from '@/types/writer'

type OutlinePanelProps = {
  outline?: WriterOutlineBlock[]
  disabled?: boolean
  onToggleStatus?: (blockId: string) => void
  onRefresh?: () => Promise<void>
  onStartDrafting?: () => Promise<void>
  onExpandBlock?: (blockId: string) => Promise<void>
  onExpandAccepted?: () => Promise<void>
}

function getStatusLabel(status: WriterOutlineBlock['status']) {
  switch (status) {
    case 'accepted':
      return '已确认'
    case 'expanded':
      return '已展开'
    default:
      return '待确认'
  }
}

export function OutlinePanel({
  outline,
  disabled,
  onToggleStatus,
  onRefresh,
  onStartDrafting,
  onExpandBlock,
  onExpandAccepted,
}: OutlinePanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">条目雏形</h2>
          <p className="mt-1 text-sm text-muted-foreground">先确认章节骨架和字段映射，再进入结构化起草会更稳。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onRefresh ? (
            <button
              type="button"
              onClick={() => onRefresh()}
              disabled={disabled}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
            >
              重新整理雏形
            </button>
          ) : null}
          {onExpandAccepted ? (
            <button
              type="button"
              onClick={() => onExpandAccepted()}
              disabled={disabled}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
            >
              展开已确认块
            </button>
          ) : null}
          {onStartDrafting ? (
            <button
              type="button"
              onClick={() => onStartDrafting()}
              disabled={disabled}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
            >
              进入结构化起草
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {!outline || outline.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
            还没有整理出雏形。你可以先点击“整理为条目雏形”。
          </div>
        ) : (
          outline.map((block) => (
            <div key={block.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{block.title}</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{block.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleStatus?.(block.id)}
                  disabled={disabled}
                  className={`rounded-full px-3 py-1 text-xs ${block.status === 'accepted' || block.status === 'expanded' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'}`}
                >
                  {getStatusLabel(block.status)}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {block.mappedFields.length === 0 ? (
                  <span className="text-xs text-muted-foreground">暂无字段映射</span>
                ) : (
                  block.mappedFields.map((field) => (
                    <span key={`${block.id}-${field}`} className="rounded-full border border-border px-3 py-1 text-xs">
                      {field}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {onExpandBlock ? (
                  <button
                    type="button"
                    onClick={() => onExpandBlock(block.id)}
                    disabled={disabled}
                    className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-60"
                  >
                    展开此块
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
