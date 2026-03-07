import 'server-only'

import path from 'node:path'
import { DEFAULT_WRITER_STORAGE_DIR } from '@/lib/writer/constants'

export function getWriterStorageRoot() {
  return path.resolve(process.cwd(), process.env.WRITER_STORAGE_DIR ?? DEFAULT_WRITER_STORAGE_DIR)
}

export function getWriterProvidersPath() {
  return path.join(getWriterStorageRoot(), 'providers.json')
}

export function getWriterPresetsPath() {
  return path.join(getWriterStorageRoot(), 'presets.json')
}

export function getWriterSessionsDir() {
  return path.join(getWriterStorageRoot(), 'sessions')
}

export function getWriterSnapshotsDir() {
  return path.join(getWriterStorageRoot(), 'snapshots')
}

export function getWriterSessionPath(id: string) {
  return path.join(getWriterSessionsDir(), `${id}.json`)
}

export function getWriterSnapshotPath(sessionId: string, snapshotId: string) {
  return path.join(getWriterSnapshotsDir(), sessionId, `${snapshotId}.json`)
}
