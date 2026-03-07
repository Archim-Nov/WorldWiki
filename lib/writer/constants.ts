import type { WriterDocumentType, WriterProviderKind } from '@/types/writer'

export const WRITER_DOCUMENT_TYPES: WriterDocumentType[] = [
  'country',
  'region',
  'creature',
  'hero',
  'story',
  'magic',
]

export const WRITER_PROVIDER_KINDS: WriterProviderKind[] = [
  'openai-compatible',
  'cli',
]

export const DEFAULT_WRITER_STORAGE_DIR = '.local/writer'

export const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com'

export const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini'

export const WRITER_SESSION_FILE_PREFIX = 'session'
