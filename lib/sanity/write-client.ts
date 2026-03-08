import 'server-only'

import { createClient } from 'next-sanity'

type SanityTokenSource = 'SANITY_API_WRITE_TOKEN' | 'SANITY_API_TOKEN' | 'SANITY_STUDIO_TOKEN' | null

type SanityWriteEnv = {
  projectId: string
  dataset: string
  token: string
  tokenSource: SanityTokenSource
}

export type SanityWriteConfigStatus = {
  enabled: boolean
  missingEnvVars: string[]
  tokenSource: SanityTokenSource
  reason: string | null
  hint: string | null
}

function readSanityWriteEnv(): SanityWriteEnv {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? ''
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? ''
  const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim()
  const apiToken = process.env.SANITY_API_TOKEN?.trim()
  const studioToken = process.env.SANITY_STUDIO_TOKEN?.trim()
  const token = writeToken || apiToken || studioToken || ''

  return {
    projectId,
    dataset,
    token,
    tokenSource: writeToken
      ? 'SANITY_API_WRITE_TOKEN'
      : apiToken
        ? 'SANITY_API_TOKEN'
        : studioToken
          ? 'SANITY_STUDIO_TOKEN'
          : null,
  }
}

function buildDisabledReason(missingEnvVars: string[]) {
  if (missingEnvVars.length === 0) return null

  if (missingEnvVars.length === 1 && missingEnvVars[0] === 'SANITY_API_WRITE_TOKEN') {
    return 'Sanity push is disabled because no write token is configured.'
  }

  return `Sanity push is disabled because these environment variables are missing: ${missingEnvVars.join(', ')}.`
}

function buildDisabledHint(missingEnvVars: string[]) {
  if (missingEnvVars.length === 0) return null

  if (missingEnvVars.length === 1 && missingEnvVars[0] === 'SANITY_API_WRITE_TOKEN') {
    return 'Add SANITY_API_WRITE_TOKEN to .env.local (SANITY_API_TOKEN and SANITY_STUDIO_TOKEN are also accepted), then restart the Next.js dev server.'
  }

  return 'Add the missing Sanity environment variables to .env.local, then restart the Next.js dev server.'
}

export function getSanityWriteConfigStatus(): SanityWriteConfigStatus {
  const env = readSanityWriteEnv()
  const missingEnvVars: string[] = []

  if (!env.projectId) missingEnvVars.push('NEXT_PUBLIC_SANITY_PROJECT_ID')
  if (!env.dataset) missingEnvVars.push('NEXT_PUBLIC_SANITY_DATASET')
  if (!env.token) missingEnvVars.push('SANITY_API_WRITE_TOKEN')

  const enabled = missingEnvVars.length === 0

  return {
    enabled,
    missingEnvVars,
    tokenSource: env.tokenSource,
    reason: enabled ? null : buildDisabledReason(missingEnvVars),
    hint: enabled ? null : buildDisabledHint(missingEnvVars),
  }
}

export function getSanityWriteClient() {
  const env = readSanityWriteEnv()

  if (!env.projectId || !env.dataset || !env.token) {
    return null
  }

  return createClient({
    projectId: env.projectId,
    dataset: env.dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
    token: env.token,
  })
}

export function isSanityWriteEnabled() {
  return getSanityWriteConfigStatus().enabled
}