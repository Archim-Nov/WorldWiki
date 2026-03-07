import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { WRITER_DOCUMENT_TYPES } from '@/lib/writer/constants'
import { listWriterLibraryItems } from '@/lib/writer/sanity/library'

export async function GET(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const url = new URL(request.url)
  const documentType = url.searchParams.get('documentType')
  const term = url.searchParams.get('term')?.trim() ?? ''

  if (!documentType || !WRITER_DOCUMENT_TYPES.includes(documentType as never)) {
    return NextResponse.json({ error: 'invalid_document_type' }, { status: 400 })
  }

  const items = await listWriterLibraryItems(documentType as never, term)
  return NextResponse.json(items)
}
