import { PresetManager, ProviderManager } from '@/components/writer'
import { listPromptPresets } from '@/lib/writer/storage/presets'
import { listProviderSummaries } from '@/lib/writer/storage/providers'

export default async function WriterSettingsPage() {
  const [providers, presets] = await Promise.all([
    listProviderSummaries(),
    listPromptPresets(),
  ])

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Writer Settings</p>
        <h1 className="mt-3 text-3xl font-semibold">Provider 与预设管理</h1>
        <p className="mt-3 text-sm text-muted-foreground">这里用于配置本地 AI 接口、CLI Provider，以及世界观和写作要求预设。</p>
      </div>

      <ProviderManager initialProviders={providers} />
      <PresetManager initialPresets={presets} />
    </div>
  )
}
