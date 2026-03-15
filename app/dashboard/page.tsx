'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatModule } from '@/components/dashboard/ChatModule'
import { CalcModule } from '@/components/dashboard/CalcModule'
import { ProtocolsModule } from '@/components/dashboard/ProtocolsModule'
import { AmbienteProvider, AmbienteSwitcher } from '@/components/AmbienteContext'

type Tab = 'chat' | 'calc' | 'proto'

const PROTOCOLS_QUICK = [
  { id: 'sepse',          label: 'Sepse',          color: '#E24B4A' },
  { id: 'iam',            label: 'IAM',             color: '#E24B4A' },
  { id: 'avc',            label: 'AVC',             color: '#E8820C' },
  { id: 'anafilaxia',     label: 'Anafilaxia',      color: '#E24B4A' },
  { id: 'intubacao',      label: 'Intubação (RSI)', color: '#378ADD' },
  { id: 'asma',           label: 'Crise asmática',  color: '#E8820C' },
  { id: 'convulsao',      label: 'Convulsão',       color: '#E24B4A' },
  { id: 'cetoacidose',    label: 'Cetoacidose',     color: '#E8820C' },
  { id: 'edema_pulmonar', label: 'EAP',             color: '#E24B4A' },
  { id: 'tep',            label: 'TEP',             color: '#E8820C' },
]

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'chat', label: 'Chat',
    icon: <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5"><path d="M2 3h12v8H9l-3 2V11H2V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
  },
  {
    id: 'calc', label: 'Calcular',
    icon: <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  },
  {
    id: 'proto', label: 'Protocolos',
    icon: <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5"><path d="M4 4h8M4 7h8M4 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>
  },
]

export default function DashboardPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('chat')
  const [profile, setProfile] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [quickProto, setQuickProto] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', user.id)
        .single() as { data: any; error: any }

      if (error || !data || data.status !== 'approved') {
        window.location.href = '/pendente'; return
      }

      setProfile(data)
      setChecking(false)
    }
    check()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function openQuickProto(id: string) {
    setTab('proto')
    setQuickProto(id)
    setSidebarOpen(false)
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f6f3]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-[#E24B4A]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span className="text-sm text-[#aaa]">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <AmbienteProvider>
      <div className="flex h-screen bg-[#f7f6f3] overflow-hidden">

        {/* OVERLAY mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR — hidden on mobile, drawer on tap */}
        <aside className={`
          fixed md:relative z-30 md:z-auto
          w-64 md:w-52 h-full
          bg-white border-r border-[#e2e0d8]
          flex flex-col overflow-hidden
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 border-b border-[#e2e0d8] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#E24B4A] rounded-[9px] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                    <path d="M10 2v6M10 12v6M2 10h6M12 10h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-bold tracking-tight leading-none">PRECEPTOR.AI</div>
                  <div className="text-[10px] text-[#aaa] mt-0.5">Copiloto de plantão</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#aaa] p-1">
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="px-3 py-2.5 border-b border-[#e2e0d8] flex-shrink-0">
            <div className="text-[10px] text-[#bbb] uppercase tracking-widest mb-1.5">Ambiente</div>
            <AmbienteSwitcher />
          </div>

          <div className="px-2 pb-2 flex-1 overflow-y-auto">
            <div className="text-[10px] text-[#bbb] uppercase tracking-widest px-2 pt-3 pb-1">Acesso rápido</div>
            {PROTOCOLS_QUICK.map(p => (
              <button key={p.id} onClick={() => openQuickProto(p.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#666] hover:bg-[#f7f6f3] hover:text-[#1a1a1a] w-full text-left transition-all">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-[#e2e0d8] flex-shrink-0">
            {profile && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-[#FCEBEB] flex items-center justify-center text-[10px] font-bold text-[#E24B4A] flex-shrink-0">
                  {profile.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{profile.nome.split(' ')[0]}</div>
                  <div className="text-[10px] text-[#aaa]">CRM-{profile.uf_crm} {profile.crm}</div>
                </div>
              </div>
            )}
            <button onClick={handleLogout}
              className="w-full text-xs text-[#aaa] hover:text-[#E24B4A] transition-colors text-left px-1">
              Sair
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* HEADER mobile */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#e2e0d8] md:hidden flex-shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="text-[#666] p-1">
              <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#E24B4A] rounded-md flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                  <path d="M10 2v6M10 12v6M2 10h6M12 10h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm font-bold">PRECEPTOR.AI</span>
            </div>
            <AmbienteSwitcher />
          </div>

          {/* TABS desktop */}
          <div className="hidden md:flex border-b border-[#e2e0d8] bg-white px-4 flex-shrink-0">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                  tab === item.id
                    ? 'text-[#1a1a1a] font-semibold border-[#E24B4A]'
                    : 'text-[#666] border-transparent hover:text-[#1a1a1a]'
                }`}>
                {item.label}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-hidden">
            {tab === 'chat'  && <ChatModule />}
            {tab === 'calc'  && <CalcModule />}
            {tab === 'proto' && (
              <ProtocolsModule
                initialProto={quickProto}
                onProtoOpen={() => setQuickProto(null)}
              />
            )}
          </div>

          {/* BOTTOM NAV mobile */}
          <nav className="md:hidden flex border-t border-[#e2e0d8] bg-white flex-shrink-0">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                  tab === item.id ? 'text-[#E24B4A]' : 'text-[#aaa]'
                }`}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </main>
      </div>
    </AmbienteProvider>
  )
}