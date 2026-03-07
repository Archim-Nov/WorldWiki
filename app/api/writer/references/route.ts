import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { searchWriterReferences } from '@/lib/writer/sanity/reference-search'

export async function GET(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const term = new URL(request.url).searchParams.get('term')?.trim() ?? ''
  return NextResponse.json(await searchWriterReferences(term))
}
