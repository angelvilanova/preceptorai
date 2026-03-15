export type UserStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'medico' | 'admin'

export interface Profile {
  id: string
  nome: string
  crm: string
  uf_crm: string
  telefone: string
  email: string
  status: UserStatus
  role: UserRole
  created_at: string
  approved_at?: string
}
