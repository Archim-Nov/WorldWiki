import 'server-only'

import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim()
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim()
const token = process.env.SANITY_API_WRITE_TOKEN?.trim()

export function getSanityWriteConfigStatus() {
  const missingEnvVars: string[] = []

  if (!projectId) missingEnvVars.push('NEXT_PUBLIC_SANITY_PROJECT_ID')
  if (!dataset) missingEnvVars.push('NEXT_PUBLIC_SANITY_DATASET')
  if (!token) missingEnvVars.push('SANITY_API_WRITE_TOKEN')

  return {
    enabled: missingEnvVars.length === 0,
    missingEnvVars,
  }
}

export const writeClient =
  getSanityWriteConfigStatus().enabled
    ? createClient({
        projectId: projectId!,
        dataset: dataset!,
        apiVersion: '2024-01-01',
        useCdn: false,
        token: token!,
      })
    : null

export function isSanityWriteEnabled() {
  return getSanityWriteConfigStatus().enabled
}
