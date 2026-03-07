'use client'

import { useMemo } from 'react'
import type { WriterCalibrationPatch, WriterCheckResult, WriterSchemaSummary } from '@/types/writer'

type CalibrationPanelProps = {
  schema: WriterSchemaSummary
  fields: Record<string, unknown>
  patches?: WriterCalibrationPatch[]
  result?: WriterCheckResult
  disabled?: boolean
  onRunCalibration: () => void
  onApplyPatch: (patchId: string) => void
  onApplyAll: () => void
}

function formatValue(value: unknown) {
  if (typeof value === 'string') {
    return value.trim().slice(0, 240)
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join('、')
      .slice(0, 240)
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2).slice(0, 240)
  }

  return String(value ?? '')
}

export function CalibrationPanel({
  schema,
  fields,
  patches,
  result,
  disabled,
  onRunCalibration,
  onApplyPatch,
  onApplyAll,
}: CalibrationPanelProps) {
  const nextPatches = patches ?? []
  const fieldLabels = useMemo(
    () => new Map(schema.fields.map((field) => [field.name, field.title])),
    [schema.fields]
  )

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">AI 校准</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            基于当前草稿和校验结果生成可一键应用的修正建议，适合作为正式提交前的最后一轮整理。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRunCalibration}
            disabled={disabled}
            className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-60"
          >
            运行 AI 校准
          </button>
          <button
            type="button"
            onClick={onApplyAll}
            disabled={disabled || nextPatches.length === 0}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-60"
          >
            一键应用全部
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>问题数：{result?.issues.length ?? 0}</span>
        <span>建议数：{nextPatches.length}</span>
      </div>

      {nextPatches.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
          {result
            ? result.issues.length === 0
              ? '当前没有需要自动校准的项，可以直接进入人工核验或提交。'
              : '当前问题更适合人工调整，例如补引用关系、核对世界观归属或手动改写正文。'
            : '先运行一次 AI 校准，这里会出现可直接应用的修正建议。'}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {nextPatches.map((patch) => {
            const fieldLabel = patch.fieldName ? fieldLabels.get(patch.fieldName) ?? patch.fieldName : '通用建议'
            const currentValue = patch.fieldName ? formatValue(fields[patch.fieldName]) : ''
            const nextValue = formatValue(patch.nextValue)

            return (
              <div key={patch.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{patch.title}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{fieldLabel}</span>
                      <span>·</span>
                      <span>{patch.kind}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onApplyPatch(patch.id)}
                    disabled={disabled}
                    className="rounded-lg border border-border px-3 py-1 text-xs disabled:opacity-60"
                  >
                    应用此建议
                  </button>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">{patch.reason}</p>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-muted/20 px-3 py-3 text-xs">
                    <div className="mb-2 uppercase tracking-[0.2em] text-muted-foreground">当前值</div>
                    <div className="whitespace-pre-wrap break-words text-foreground/80">
                      {currentValue || '（空）'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/20 px-3 py-3 text-xs">
                    <div className="mb-2 uppercase tracking-[0.2em] text-muted-foreground">建议值</div>
                    <div className="whitespace-pre-wrap break-words text-foreground">{nextValue || '（空）'}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
