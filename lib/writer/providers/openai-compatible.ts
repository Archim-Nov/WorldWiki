import 'server-only'

import type { WriterProviderConfig } from '@/types/writer'
import { DEFAULT_OPENAI_BASE_URL, DEFAULT_OPENAI_MODEL } from '@/lib/writer/constants'
import type { WriterProvider, WriterProviderRequest } from '@/lib/writer/providers/base'
import { parseWriterResponse } from '@/lib/writer/providers/parse'

type ChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

export class OpenAICompatibleProvider implements WriterProvider {
  readonly config: WriterProviderConfig

  constructor(config: WriterProviderConfig) {
    this.config = config
  }

  async testConnection() {
    const baseUrl = this.config.baseUrl?.trim() || DEFAULT_OPENAI_BASE_URL
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return { ok: false, message: `连接失败：${response.status}` }
    }

    return { ok: true, message: '连接成功' }
  }

  async generate(request: WriterProviderRequest) {
    const baseUrl = this.config.baseUrl?.trim() || DEFAULT_OPENAI_BASE_URL
    const model = this.config.model?.trim() || DEFAULT_OPENAI_MODEL

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: this.config.temperature ?? 0.7,
        messages: [
          {
            role: 'system',
            content: request.systemPrompt,
          },
          {
            role: 'user',
            content: request.userPrompt,
          },
        ],
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`provider_http_${response.status}:${errorText}`)
    }

    const json = (await response.json()) as ChatCompletionsResponse
    const content = json.choices?.[0]?.message?.content?.trim() ?? ''
    return parseWriterResponse(content)
  }
}
