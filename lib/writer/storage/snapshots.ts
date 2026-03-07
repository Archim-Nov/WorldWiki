import 'server-only'

import { mkdir } from 'node:fs/promises'
import type { WriterDraft, WriterSnapshot } from '@/types/writer'
import { createTimestamp, createWriterId, deepClone } from '@/lib/writer/utils'
import { ensureWriterStorage, listJsonFiles, readJsonFile, writeJsonFile } from '@/lib/writer/storage/fs'
import { getWriterSnapshotPath, getWriterSnapshotsDir } from '@/lib/writer/storage/paths'

export async function saveSnapshot(sessionId: string, draft: WriterDraft, reason: string) {
  await ensureWriterStorage()
  const snapshot: WriterSnapshot = {
    id: createWriterId('snapshot'),
    sessionId,
    createdAt: createTimestamp(),
    reason,
    draft: deepClone(draft),
  }

  await mkdir(`${getWriterSnapshotsDir()}/${sessionId}`, { recursive: true })
  await writeJsonFile(getWriterSnapshotPath(sessionId, snapshot.id), snapshot)
  return snapshot
}

export async function listSnapshots(sessionId: string) {
  const dir = `${getWriterSnapshotsDir()}/${sessionId}`
  const files = await listJsonFiles(dir)
  const snapshots = await Promise.all(
    files.map((file) => readJsonFile<WriterSnapshot>(`${dir}/${file}`, null as never))
  )

  return snapshots
    .filter(Boolean)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}
