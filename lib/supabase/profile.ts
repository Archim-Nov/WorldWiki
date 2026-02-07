import { createClient } from './server'
import type { Profile, UserRole } from '@/types/profile'

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, role, created_at')
    .eq('id', user.id)
    .single()

  return data as Profile | null
}

export async function hasRole(role: UserRole): Promise<boolean> {
  const profile = await getUserProfile()
  return profile?.role === role
}
