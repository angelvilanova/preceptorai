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
    icon: <svg viewBox="0 0 16 16" fill="none" width="20" height="20"><path d="M2 3h12v8H9l-3 2V11H2V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
  },
  {
    id: 'calc', label: 'Calcular',
    icon: <svg viewBox="0 0 16 16" fill="none" width="20" height="20"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  },
  {
    id: 'proto', label: 'Protocolos',
    icon: <svg viewBox="0 0 16 16" fill="none" width="20" height="20"><path d="M4 4h8M4 7h8M4 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>
  },
]

export default function DashboardPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('chat')
  const [profile, setProfile] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [quickProto, setQuickProto] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    async function checkAuth() {
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
    checkAuth()
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
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#f7f6f3' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <svg style={{ animation:'spin 0.8s linear infinite', width:32, height:32, color:'#E24B4A' }} viewBox="0 0 24 24" fill="none">
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize:14, color:'#aaa' }}>Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <AmbienteProvider>
      <div style={{ display:'flex', height:'100vh', background:'#f7f6f3', overflow:'hidden', position:'relative' }}>

        {/* OVERLAY */}
        {sidebarOpen && isMobile && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:20 }}
          />
        )}

        {/* SIDEBAR */}
        <aside style={{
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile ? (sidebarOpen ? 0 : -280) : 0,
          top: 0,
          width: isMobile ? 280 : 208,
          minWidth: isMobile ? 280 : 208,
          height: '100%',
          zIndex: isMobile ? 30 : 'auto',
          background: 'white',
          borderRight: '1px solid #e2e0d8',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'left 0.2s ease',
        }}>
          {/* Brand */}
          <div style={{ padding:'16px', borderBottom:'1px solid #e2e0d8', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, background:'#E24B4A', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
                    <path d="M10 2v6M10 12v6M2 10h6M12 10h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, letterSpacing:'-0.3px' }}>PRECEPTOR.AI</div>
                  <div style={{ fontSize:10, color:'#aaa', marginTop:1 }}>Copiloto de plantão</div>
                </div>
              </div>
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa', padding:4 }}>
                  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Ambiente */}
          <div style={{ padding:'10px 12px', borderBottom:'1px solid #e2e0d8', flexShrink:0 }}>
            <div style={{ fontSize:10, color:'#bbb', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Ambiente</div>
            <AmbienteSwitcher />
          </div>

          {/* Quick access */}
          <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
            <div style={{ fontSize:10, color:'#bbb', textTransform:'uppercase', letterSpacing:'0.06em', padding:'12px 8px 4px' }}>Acesso rápido</div>
            {PROTOCOLS_QUICK.map(p => (
              <button key={p.id} onClick={() => openQuickProto(p.id)} style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'8px 12px', borderRadius:8,
                fontSize:13, color:'#666',
                background:'none', border:'none', cursor:'pointer',
                width:'100%', textAlign:'left',
              }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:p.color, flexShrink:0 }} />
                {p.label}
              </button>
            ))}
          </div>

          {/* User */}
          <div style={{ padding:12, borderTop:'1px solid #e2e0d8', flexShrink:0 }}>
            {profile && (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#FCEBEB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#E24B4A', flexShrink:0 }}>
                  {profile.nome.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile.nome.split(' ')[0]}</div>
                  <div style={{ fontSize:10, color:'#aaa' }}>CRM-{profile.uf_crm} {profile.crm}</div>
                </div>
              </div>
            )}
            <button onClick={handleLogout} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#aaa', padding:'2px 4px' }}>
              Sair
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

          {/* HEADER mobile */}
          {isMobile && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:'white', borderBottom:'1px solid #e2e0d8', flexShrink:0 }}>
              <button onClick={() => setSidebarOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'#666', padding:4 }}>
                <svg viewBox="0 0 16 16" fill="none" width="20" height="20">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:24, height:24, background:'#E24B4A', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                    <path d="M10 2v6M10 12v6M2 10h6M12 10h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{ fontSize:13, fontWeight:700 }}>PRECEPTOR.AI</span>
              </div>
              <AmbienteSwitcher />
            </div>
          )}

          {/* TABS desktop */}
          {!isMobile && (
            <div style={{ display:'flex', borderBottom:'1px solid #e2e0d8', background:'white', padding:'0 16px', flexShrink:0 }}>
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => setTab(item.id)} style={{
  padding:'12px 16px', fontSize:13,
  color: tab === item.id ? '#1a1a1a' : '#666',
  fontWeight: tab === item.id ? 600 : 400,
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: tab === item.id ? '2px solid #E24B4A' : '2px solid transparent',
  background:'none',
  cursor:'pointer', marginBottom:-1,
}}>
  {item.label}
</button>
              ))}
            </div>
          )}

          {/* CONTENT */}
          <div style={{ flex:1, overflow:'hidden' }}>
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
          {isMobile && (
            <nav style={{ display:'flex', borderTop:'1px solid #e2e0d8', background:'white', flexShrink:0 }}>
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => setTab(item.id)} style={{
                  flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  padding:'10px 0', fontSize:10, fontWeight:500,
                  color: tab === item.id ? '#E24B4A' : '#aaa',
                  background:'none', border:'none', cursor:'pointer',
                }}>
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </main>
      </div>
    </AmbienteProvider>
  )
}