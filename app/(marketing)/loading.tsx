export default function MarketingLoading() {
  return (
    <div className="page-enter container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-64 w-full rounded-2xl bg-muted animate-pulse mt-8" />
      </div>
    </div>
  )
}
