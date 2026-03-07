import 'server-only'

import type { WriterPromptPreset } from '@/types/writer'
import { createTimestamp, createWriterId } from '@/lib/writer/utils'
import { ensureWriterStorage, readJsonFile, writeJsonFile } from '@/lib/writer/storage/fs'
import { getWriterPresetsPath } from '@/lib/writer/storage/paths'

async function readPresets() {
  await ensureWriterStorage()
  return readJsonFile<WriterPromptPreset[]>(getWriterPresetsPath(), [])
}

async function writePresets(presets: WriterPromptPreset[]) {
  await writeJsonFile(getWriterPresetsPath(), presets)
}

export async function listPromptPresets() {
  return readPresets()
}

export async function savePromptPreset(input: Partial<WriterPromptPreset>) {
  const presets = await readPresets()
  const nextPreset: WriterPromptPreset = {
    id: input.id ?? createWriterId('preset'),
    name: input.name?.trim() || '未命名预设',
    scope: input.scope ?? 'task',
    documentType: input.documentType,
    content: input.content?.trim() ?? '',
    enabled: input.enabled ?? true,
    updatedAt: createTimestamp(),
  }

  const nextPresets = presets.filter((preset) => preset.id !== nextPreset.id)
  nextPresets.unshift(nextPreset)
  await writePresets(nextPresets)
  return nextPreset
}

export async function deletePromptPreset(id: string) {
  const presets = await readPresets()
  await writePresets(presets.filter((preset) => preset.id !== id))
}
