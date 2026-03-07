import { NextResponse } from 'next/server'
import { requireWriterAccess } from '@/lib/writer/api/auth'
import { badRequest, readJsonObject } from '@/lib/writer/api/validators'
import { classifyWriterType } from '@/lib/writer/classifier/service'

export async function POST(request: Request) {
  const accessResponse = await requireWriterAccess()
  if (accessResponse) return accessResponse

  const body = await readJsonObject(request)
  if (!body) return badRequest('invalid_body')

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (!text) return badRequest('missing_text')

  return NextResponse.json(await classifyWriterType(text))
}
