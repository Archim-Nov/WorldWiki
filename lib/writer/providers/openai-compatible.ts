import 'server-only'

import type { WriterGenerationResult, WriterProviderConfig } from '@/types/writer'
import { DEFAULT_OPENAI_BASE_URL, DEFAULT_OPENAI_MODEL } from '@/lib/writer/constants'
import type { WriterProvider, WriterProviderRequest } from '@/lib/writer/providers/base'

type ChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

function extractJsonBlock(rawText: string) {
  const fencedMatch = rawText.match(/```json\s*([\s\S]*?)```/i)
  return fencedMatch?.[1] ?? rawText
}

function parseGeneratedPayload(rawText: string): WriterGenerationResult {
  try {
    const parsed = JSON.parse(extractJsonBlock(rawText)) as {
      assistantMessage?: string
      title?: string
      fields?: Record<string, unknown>
    }

    return {
      assistantMessage: parsed.assistantMessage ?? '已生成结构化草稿。',
      title: parsed.title,
      fields: parsed.fields ?? {},
      rawText,
    }
  } catch {
    return {
      assistantMessage: rawText.trim() || '模型未返回可解析内容。',
      fields: {},
      rawText,
    }
  }
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

  async generate(request: WriterProviderRequest): Promise<WriterGenerationResult> {
    const baseUrl = this.config.baseUrl?.trim() || DEFAULT_OPENAI_BASE_URL
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || DEFAULT_OPENAI_MODEL,
        temperature: this.config.temperature ?? 0.4,
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
    return parseGeneratedPayload(content)
  }
}
