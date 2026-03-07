import 'server-only'

import { NextResponse } from 'next/server'
import { getUserProfile } from '@/lib/supabase/profile'

export async function requireWriterAccess() {
  const profile = await getUserProfile()
  if (!profile || profile.role !== 'editor') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  return null
}
