import 'server-only'

import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim()
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim()
const token = process.env.SANITY_API_WRITE_TOKEN?.trim()

export const writeClient =
  projectId && dataset && token
    ? createClient({
        projectId,
        dataset,
        apiVersion: '2024-01-01',
        useCdn: false,
        token,
      })
    : null

export function isSanityWriteEnabled() {
  return Boolean(writeClient)
}
