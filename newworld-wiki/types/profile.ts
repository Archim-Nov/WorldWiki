export type UserRole = 'viewer' | 'editor'

export interface Profile {
  id: string
  role: UserRole
  created_at: string
}
