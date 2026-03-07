import type { WriterCheckResult } from '@/types/writer'

export function ChecksPanel({ result }: { result?: WriterCheckResult }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">校验结果</h2>
      {!result ? (
        <p className="mt-3 text-sm text-muted-foreground">尚未运行检查。执行一次校验后，这里会显示必填字段、重复条目和推荐关联。</p>
      ) : (
        <div className="mt-4 space-y-5">
          <div>
            <h3 className="text-sm font-medium">问题项</h3>
            <div className="mt-2 space-y-2">
              {result.issues.length === 0 ? (
                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                  当前没有结构化错误。
                </div>
              ) : (
                result.issues.map((issue) => (
                  <div key={issue.id} className="rounded-lg border border-border px-3 py-3 text-sm">
                    <div className="font-medium">{issue.message}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {issue.level} · {issue.code}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">疑似重复</h3>
            <div className="mt-2 space-y-2">
              {result.duplicates.length === 0 ? (
                <div className="text-sm text-muted-foreground">未发现明显重复条目。</div>
              ) : (
                result.duplicates.map((duplicate) => (
                  <div key={duplicate.id} className="rounded-lg border border-border px-3 py-3 text-sm">
                    <div className="font-medium">{duplicate.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{duplicate.type}</div>
                    <div className="mt-2 text-muted-foreground">{duplicate.reason}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">推荐关联</h3>
            <div className="mt-2 space-y-2">
              {result.relatedSuggestions.length === 0 ? (
                <div className="text-sm text-muted-foreground">暂无推荐关联条目。</div>
              ) : (
                result.relatedSuggestions.map((suggestion) => (
                  <div key={suggestion.refId} className="rounded-lg border border-border px-3 py-3 text-sm">
                    <div className="font-medium">{suggestion.label}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{suggestion.type}</div>
                    <div className="mt-2 text-muted-foreground">{suggestion.reason}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
