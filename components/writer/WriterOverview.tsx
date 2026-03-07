import Link from 'next/link'
import type { WriterSession } from '@/types/writer'

type WriterOverviewProps = {
  sessions: WriterSession[]
  basePath: string
}

export function WriterOverview({ sessions, basePath }: WriterOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Writer</p>
        <h1 className="mt-3 text-3xl font-semibold">本地 AI 创作工作台</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          从自然语言描述出发，自动判断条目类型，生成结构化草稿，并在提交前完成基本校验。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`${basePath}/new`}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            新建条目
          </Link>
          <Link
            href={`${basePath}/settings`}
            className="rounded-lg border border-border px-4 py-2 text-sm"
          >
            Writer 设置
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">总会话</div>
          <div className="mt-2 text-3xl font-semibold">{sessions.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">最近更新</div>
          <div className="mt-2 text-sm font-medium">
            {sessions[0]?.updatedAt ? new Date(sessions[0].updatedAt).toLocaleString() : '暂无'}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">当前阶段</div>
          <div className="mt-2 text-sm font-medium">MVP：草稿生成 / 校验 / Draft 提交</div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">最近会话</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              继续编辑本地草稿，或新建一条新的世界观条目。
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              还没有 Writer 会话，先创建一个条目草稿吧。
            </div>
          ) : (
            sessions.map((session) => (
              <Link
                key={session.id}
                href={`${basePath}/${session.id}`}
                className="block rounded-xl border border-border px-4 py-4 transition hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-medium">{session.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {session.documentType}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{session.status}</div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {session.draft.sourceText || '暂无创作简介'}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
