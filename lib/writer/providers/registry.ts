import 'server-only'

import { OpenAICompatibleProvider } from '@/lib/writer/providers/openai-compatible'
import { CliWriterProvider } from '@/lib/writer/providers/cli'
import type { WriterProvider } from '@/lib/writer/providers/base'
import { getProviderConfig, listProviderConfigs } from '@/lib/writer/storage/providers'

export async function getProviderInstance(providerId?: string): Promise<WriterProvider | null> {
  const config = await getProviderConfig(providerId)
  if (!config || !config.enabled) return null

  if (config.kind === 'cli') {
    return new CliWriterProvider(config)
  }

  return new OpenAICompatibleProvider(config)
}

export async function getDefaultProviderConfig() {
  const configuredDefaultId = process.env.WRITER_DEFAULT_PROVIDER?.trim()
  if (configuredDefaultId) {
    return getProviderConfig(configuredDefaultId)
  }

  const providers = await listProviderConfigs()
  return providers.find((provider) => provider.enabled) ?? null
}
