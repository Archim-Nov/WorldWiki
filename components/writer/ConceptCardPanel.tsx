'use client'

import type { WriterConceptCard } from '@/types/writer'

type ConceptCardPanelProps = {
  conceptCard?: WriterConceptCard
  onToggleDecisionLock?: (decisionId: string) => void
}

function getTypeLabel(documentType: string) {
  switch (documentType) {
    case 'country':
      return '国家'
    case 'region':
      return '区域'
    case 'creature':
      return '生物'
    case 'hero':
      return '角色'
    case 'story':
      return '故事'
    case 'magic':
      return '魔法'
    default:
      return documentType
  }
}

export function ConceptCardPanel({ conceptCard, onToggleDecisionLock }: ConceptCardPanelProps) {
  if (!conceptCard) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
        先开始一轮概念对话，AI 会在这里持续整理你的条目意图卡。
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">条目意图卡</h2>
          <p className="mt-1 text-sm text-muted-foreground">对话结果会持续沉淀到这里，供后续结构化起草使用。</p>
        </div>
        <div className="text-xs text-muted-foreground">{new Date(conceptCard.updatedAt).toLocaleString()}</div>
      </div>

      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">核心前提</div>
          <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm leading-6">{conceptCard.premise || '等待 AI 与你共同整理核心概念。'}</div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">候选条目类型</div>
          <div className="flex flex-wrap gap-2">
            {conceptCard.candidateTypes.length === 0 ? (
              <span className="text-sm text-muted-foreground">暂无候选类型</span>
            ) : (
              conceptCard.candidateTypes.slice(0, 4).map((item) => (
                <div key={`${item.documentType}-${item.reason}`} className="rounded-full border border-border px-3 py-1 text-xs">
                  {getTypeLabel(item.documentType)} · {item.score.toFixed(2)}
                </div>
              ))
            )}
          </div>
        </div>

        {conceptCard.tone ? (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">文风 / 调性</div>
            <div className="text-sm">{conceptCard.tone}</div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">创作目标</div>
            {conceptCard.goals.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无已确认目标</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {conceptCard.goals.map((goal) => (
                  <li key={goal} className="rounded-xl border border-border px-3 py-2">
                    {goal}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">约束与边界</div>
            {conceptCard.constraints.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无明确限制</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {conceptCard.constraints.map((constraint) => (
                  <li key={constraint} className="rounded-xl border border-border px-3 py-2">
                    {constraint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">待澄清问题</div>
          {conceptCard.openQuestions.length === 0 ? (
            <div className="text-sm text-muted-foreground">当前没有待补充问题，可以尝试进入结构化起草。</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {conceptCard.openQuestions.map((question) => (
                <li key={question} className="rounded-xl border border-border px-3 py-2">
                  {question}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">已沉淀决定</div>
          {conceptCard.decisions.length === 0 ? (
            <div className="text-sm text-muted-foreground">AI 还没有提炼出稳定决定。</div>
          ) : (
            <div className="space-y-3">
              {conceptCard.decisions.map((decision) => (
                <div key={decision.id} className="rounded-xl border border-border px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{decision.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{decision.value}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleDecisionLock?.(decision.id)}
                      className={`rounded-full px-3 py-1 text-xs ${decision.locked ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'}`}
                    >
                      {decision.locked ? '已锁定' : '可变更'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
