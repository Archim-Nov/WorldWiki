import 'server-only'

import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  getWriterSessionsDir,
  getWriterSnapshotsDir,
  getWriterStorageRoot,
} from '@/lib/writer/storage/paths'

export async function ensureWriterStorage() {
  await mkdir(getWriterStorageRoot(), { recursive: true })
  await mkdir(getWriterSessionsDir(), { recursive: true })
  await mkdir(getWriterSnapshotsDir(), { recursive: true })
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(filePath, 'utf8')
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

export async function writeJsonFile(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(value, null, 2), 'utf8')
}

export async function deleteJsonFile(filePath: string) {
  await rm(filePath, { force: true })
}

export async function listJsonFiles(dirPath: string) {
  try {
    const entries = await readdir(dirPath)
    return entries.filter((entry) => entry.endsWith('.json'))
  } catch {
    return []
  }
}
