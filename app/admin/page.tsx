'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function AdminPage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data: profile } = await supabase
        .from('profiles').select('role, status').eq('id', user.id).single()

      if (!profile || profile.role !== 'admin') {
        window.location.href = '/dashboard'
        return
      }
      setChecking(false)
      loadProfiles('pending')
    }
    checkAdmin()
  }, [])

  async function loadProfiles(f: 'pending' | 'approved' | 'rejected') {
    setLoading(true)
    setFilter(f)
    // Admin usa service_role via API route para buscar todos
    const res = await fetch(`/api/admin/profiles?status=${f}`)
    const data = await res.json()
    setProfiles(data.profiles || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await fetch('/api/admin/profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    loadProfiles(filter)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f6f3]">
        <svg className="animate-spin w-8 h-8 text-[#E24B4A]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3"/>
          <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <div className="bg-white border-b border-[#e2e0d8] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E24B4A] rounded-[9px] flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path d="M10 2v6M10 12v6M2 10h6M12 10h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="font-bold text-sm">PRECEPTOR.AI</span>
            <span className="text-[#aaa] text-sm ml-2">— Painel Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-xs text-[#666] hover:text-[#E24B4A] transition-colors">← Ir para o app</a>
          <button onClick={handleLogout} className="text-xs text-[#aaa] hover:text-[#E24B4A] transition-colors">Sair</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <h1 className="text-xl font-bold mb-1">Gerenciar cadastros</h1>
        <p className="text-sm text-[#666] mb-6">Revise e aprove solicitações de acesso de médicos.</p>

        <div className="flex gap-2 mb-6">
          {(['pending','approved','rejected'] as const).map(s => (
            <button key={s} onClick={() => loadProfiles(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === s
                  ? s === 'pending'  ? 'bg-[#FAEEDA] text-[#BA7517]'
                  : s === 'approved' ? 'bg-[#edf7f2] text-[#3d9b6e]'
                  : 'bg-[#FCEBEB] text-[#E24B4A]'
                  : 'bg-white border border-[#e2e0d8] text-[#666] hover:border-[#ccc]'
              }`}>
              {{ pending:'⏳ Pendentes', approved:'✓ Aprovados', rejected:'✗ Recusados' }[s]}
            </button>
          ))}
        </div>

        <div className="bg-white border border-[#e2e0d8] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#aaa] text-sm">Carregando...</div>
          ) : profiles.length === 0 ? (
            <div className="p-12 text-center text-[#aaa] text-sm">Nenhum registro encontrado.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e0d8] bg-[#f7f6f3]">
                  {['Nome','CRM','WhatsApp','E-mail','Data','Ações'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#999] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p, i) => (
                  <tr key={p.id} className={`border-b border-[#f0ede4] last:border-0 ${i%2===0?'':'bg-[#fafaf8]'}`}>
                    <td className="px-5 py-3.5 text-sm font-semibold">{p.nome}</td>
                    <td className="px-5 py-3.5 text-sm text-[#666]">CRM-{p.uf_crm} {p.crm}</td>
                    <td className="px-5 py-3.5 text-sm text-[#666]">{p.telefone}</td>
                    <td className="px-5 py-3.5 text-sm text-[#666]">{p.email}</td>
                    <td className="px-5 py-3.5 text-xs text-[#aaa]">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3.5">
                      {filter === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(p.id, 'approved')} className="px-3 py-1.5 bg-[#edf7f2] text-[#3d9b6e] text-xs font-semibold rounded-lg hover:bg-[#d4f0e3] transition-colors">Aprovar</button>
                          <button onClick={() => updateStatus(p.id, 'rejected')} className="px-3 py-1.5 bg-[#FCEBEB] text-[#E24B4A] text-xs font-semibold rounded-lg hover:bg-[#f9d5d5] transition-colors">Recusar</button>
                        </div>
                      )}
                      {filter === 'approved' && <span className="text-xs text-[#3d9b6e] font-semibold">✓ Ativo</span>}
                      {filter === 'rejected' && (
                        <button onClick={() => updateStatus(p.id, 'approved')} className="px-3 py-1.5 bg-[#edf7f2] text-[#3d9b6e] text-xs font-semibold rounded-lg hover:bg-[#d4f0e3] transition-colors">Aprovar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
