type DetailRouteLoadingProps = {
  label: string
}

export function DetailRouteLoading({ label }: DetailRouteLoadingProps) {
  return (
    <div className="page-enter" data-testid="detail-route-loading">
      <section className="relative h-[56svh] min-h-[320px] overflow-hidden border-b border-border/40 bg-muted/30">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-muted/35 via-muted/20 to-background" />
        <div className="container relative mx-auto flex h-full items-end px-4 pb-10">
          <div className="space-y-4">
            <div className="h-3 w-36 rounded-full bg-muted animate-pulse" />
            <div className="h-10 w-[min(72vw,28rem)] rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 sm:py-14">
        <p className="mb-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <div className="space-y-4 max-w-3xl">
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-[92%] rounded bg-muted animate-pulse" />
          <div className="h-4 w-[88%] rounded bg-muted animate-pulse" />
          <div className="h-4 w-[84%] rounded bg-muted animate-pulse" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-44 rounded-2xl border border-border/50 bg-muted/40 animate-pulse" />
          <div className="h-44 rounded-2xl border border-border/50 bg-muted/40 animate-pulse" />
          <div className="h-44 rounded-2xl border border-border/50 bg-muted/40 animate-pulse" />
        </div>
      </section>
    </div>
  )
}
