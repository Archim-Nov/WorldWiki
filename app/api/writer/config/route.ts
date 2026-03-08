import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { listProviderSummaries } from '@/lib/writer/storage/providers'
import { listPromptPresets } from '@/lib/writer/storage/presets'
import { listWriterSchemas } from '@/lib/writer/schema/introspect'
import { getSanityWriteConfigStatus } from '@/lib/sanity/write-client'

export async function GET() {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const [providers, presets, schemas] = await Promise.all([
    listProviderSummaries(),
    listPromptPresets(),
    Promise.resolve(listWriterSchemas()),
  ])

  const sanityWrite = getSanityWriteConfigStatus()

  return NextResponse.json({
    enabled: process.env.WRITER_ENABLED !== 'false',
    canSubmit: sanityWrite.enabled,
    sanityWrite,
    providers,
    presets,
    schemas,
  })
}