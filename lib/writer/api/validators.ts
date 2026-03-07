import { NextResponse } from 'next/server'
import { getObject, normalizeString } from '@/lib/api/security'

export async function readJsonObject(request: Request) {
  try {
    const body = await request.json()
    return getObject(body)
  } catch {
    return null
  }
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => normalizeString(item)).filter(Boolean)
}
