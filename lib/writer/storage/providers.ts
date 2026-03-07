import 'server-only'

import type { WriterProviderConfig, WriterProviderSummary } from '@/types/writer'
import { createTimestamp, createWriterId } from '@/lib/writer/utils'
import { ensureWriterStorage, readJsonFile, writeJsonFile } from '@/lib/writer/storage/fs'
import { getWriterProvidersPath } from '@/lib/writer/storage/paths'

function normalizeProviderConfig(input: Partial<WriterProviderConfig>): WriterProviderConfig {
  return {
    id: input.id ?? createWriterId('provider'),
    name: input.name?.trim() || 'Unnamed Provider',
    kind: input.kind ?? 'openai-compatible',
    enabled: input.enabled ?? true,
    model: input.model?.trim(),
    baseUrl: input.baseUrl?.trim(),
    apiKey: input.apiKey?.trim(),
    command: input.command?.trim(),
    args: input.args ?? [],
    temperature: input.temperature,
    updatedAt: createTimestamp(),
  }
}

async function readProviders() {
  await ensureWriterStorage()
  return readJsonFile<WriterProviderConfig[]>(getWriterProvidersPath(), [])
}

async function writeProviders(providers: WriterProviderConfig[]) {
  await writeJsonFile(getWriterProvidersPath(), providers)
}

export function maskProviderConfig(provider: WriterProviderConfig): WriterProviderSummary {
  return {
    id: provider.id,
    name: provider.name,
    kind: provider.kind,
    enabled: provider.enabled,
    model: provider.model,
    baseUrl: provider.baseUrl,
    command: provider.command,
    args: provider.args,
    temperature: provider.temperature,
    updatedAt: provider.updatedAt,
    hasApiKey: Boolean(provider.apiKey),
    apiKeyPreview: provider.apiKey ? `***${provider.apiKey.slice(-4)}` : undefined,
  }
}

export async function listProviderConfigs() {
  return readProviders()
}

export async function listProviderSummaries() {
  const providers = await readProviders()
  return providers.map(maskProviderConfig)
}

export async function saveProviderConfig(input: Partial<WriterProviderConfig>) {
  const providers = await readProviders()
  const nextProvider = normalizeProviderConfig(input)
  const nextProviders = providers.filter((provider) => provider.id !== nextProvider.id)
  nextProviders.unshift(nextProvider)
  await writeProviders(nextProviders)
  return nextProvider
}

export async function deleteProviderConfig(id: string) {
  const providers = await readProviders()
  const nextProviders = providers.filter((provider) => provider.id !== id)
  await writeProviders(nextProviders)
}

export async function getProviderConfig(id?: string) {
  const providers = await readProviders()
  if (id) return providers.find((provider) => provider.id === id) ?? null
  return providers.find((provider) => provider.enabled) ?? null
}
