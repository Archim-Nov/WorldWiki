import type { WriterGenerationResult, WriterProviderConfig } from '@/types/writer'

export type WriterProviderRequest = {
  systemPrompt: string
  userPrompt: string
}

export interface WriterProvider {
  readonly config: WriterProviderConfig
  generate(request: WriterProviderRequest): Promise<WriterGenerationResult>
  testConnection(): Promise<{ ok: boolean; message: string }>
}
