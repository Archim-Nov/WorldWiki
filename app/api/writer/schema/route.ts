import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { getWriterSchemaSummary, listWriterSchemas } from '@/lib/writer/schema/introspect'
import { WRITER_DOCUMENT_TYPES } from '@/lib/writer/constants'

export async function GET(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const documentType = new URL(request.url).searchParams.get('documentType')
  if (documentType && WRITER_DOCUMENT_TYPES.includes(documentType as never)) {
    return NextResponse.json(getWriterSchemaSummary(documentType as never))
  }

  return NextResponse.json(listWriterSchemas())
}
