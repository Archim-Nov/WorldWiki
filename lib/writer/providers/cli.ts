import 'server-only'

import { spawn } from 'node:child_process'
import type { WriterProviderConfig } from '@/types/writer'
import type { WriterProvider, WriterProviderRequest } from '@/lib/writer/providers/base'
import { parseWriterResponse } from '@/lib/writer/providers/parse'

function buildPrompt(request: WriterProviderRequest) {
  return `${request.systemPrompt}\n\n${request.userPrompt}`
}

export class CliWriterProvider implements WriterProvider {
  readonly config: WriterProviderConfig

  constructor(config: WriterProviderConfig) {
    this.config = config
  }

  async testConnection() {
    if (!this.config.command) {
      return { ok: false, message: '未配置 CLI 命令' }
    }

    return { ok: true, message: 'CLI Provider 已配置' }
  }

  async generate(request: WriterProviderRequest) {
    if (!this.config.command) {
      throw new Error('cli_command_missing')
    }

    const stdout = await new Promise<string>((resolve, reject) => {
      const child = spawn(this.config.command!, this.config.args ?? [], {
        stdio: 'pipe',
        shell: true,
      })

      let output = ''
      let errorOutput = ''

      child.stdout.on('data', (chunk) => {
        output += String(chunk)
      })

      child.stderr.on('data', (chunk) => {
        errorOutput += String(chunk)
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output)
          return
        }

        reject(new Error(errorOutput || `cli_exit_${code}`))
      })

      child.stdin.write(buildPrompt(request))
      child.stdin.end()
    })

    return parseWriterResponse(stdout)
  }
}
