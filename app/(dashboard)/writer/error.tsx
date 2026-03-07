'use client'

export default function WriterError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-destructive">Writer 页面加载失败</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      <button type="button" onClick={reset} className="mt-4 rounded-lg border border-border px-4 py-2 text-sm">
        重试
      </button>
    </div>
  )
}
