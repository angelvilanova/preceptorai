'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nome: '', uf: '', crm: '', telefone: '', email: '', senha: '' })

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  function maskTel(v: string) {
    v = v.replace(/\D/g, '').slice(0, 11)
    if (v.length > 6) return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`
    if (v.length > 2) return `(${v.slice(0,2)}) ${v.slice(2)}`
    return v
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    const { nome, uf, crm, telefone, email, senha } = form
    if (!nome || !uf || !crm || !telefone || !email || !senha) { setError('Preencha todos os campos.'); return }
    if (uf.length !== 2) { setError('UF inválida (ex: SP).'); return }
    if (senha.length < 8) { setError('Senha deve ter no mínimo 8 caracteres.'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, uf, crm, telefone, email, senha }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro ao cadastrar.'); setLoading(false); return }
      sessionStorage.setItem('cad_nome', nome)
      sessionStorage.setItem('cad_crm', `CRM-${uf.toUpperCase()} ${crm}`)
      sessionStorage.setItem('cad_tel', `+55 ${telefone}`)
      router.push('/pendente')
    } catch { setError('Erro de conexão. Tente novamente.'); setLoading(false) }
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-[440px] min-w-[440px] bg-white border-r border-[#e2e0d8] flex flex-col p-12 overflow-y-auto">
        <BrandLogo />
        <h1 className="text-2xl font-bold tracking-tight mb-1.5">Solicitar acesso</h1>
        <p className="text-sm text-[#666] mb-6 leading-relaxed">Preencha os dados abaixo. Seu cadastro será revisado e você receberá acesso em até 24h.</p>
        {error && <div className="bg-[#FCEBEB] text-[#791F1F] border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>}
        <form onSubmit={handleCadastro} className="flex flex-col gap-4">
          <div>
            <label className="form-label">Nome completo</label>
            <input className="form-input" type="text" placeholder="Dr. João Silva" value={form.nome} onChange={e => set('nome', e.target.value)} />
          </div>
          <div>
            <label className="form-label">CRM</label>
            <div className="flex gap-2">
              <input className="form-input w-16 text-center font-semibold uppercase" type="text" placeholder="UF" maxLength={2} value={form.uf} onChange={e => set('uf', e.target.value.toUpperCase().replace(/[^A-Z]/g,''))} />
              <input className="form-input flex-1" type="text" placeholder="000000" value={form.crm} onChange={e => set('crm', e.target.value.replace(/\D/g,''))} />
            </div>
            <p className="text-xs text-[#aaa] mt-1">Será validado no CFM antes da aprovação.</p>
          </div>
          <div>
            <label className="form-label">WhatsApp</label>
            <div className="flex gap-2">
              <div className="form-input w-14 text-center font-semibold text-[#666]">+55</div>
              <input className="form-input flex-1" type="tel" placeholder="(11) 99999-9999" value={form.telefone} onChange={e => set('telefone', maskTel(e.target.value))} />
            </div>
            <p className="text-xs text-[#aaa] mt-1">Confirmação de acesso enviada por aqui.</p>
          </div>
          <div>
            <label className="form-label">E-mail</label>
            <input className="form-input" type="email" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Criar senha</label>
            <input className="form-input" type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={e => set('senha', e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-1 flex items-center justify-center gap-2">
            {loading ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> : 'Solicitar acesso'}
          </button>
        </form>
        <p className="text-center text-sm text-[#666] mt-5">Já tem conta?{' '}<Link href="/login" className="text-[#E24B4A] font-semibold hover:underline">Entrar</Link></p>
      </div>
      <div className="flex-1 bg-[#f7f6f3] flex items-center justify-center p-12">
        <div className="max-w-[420px] w-full">
          <div className="inline-flex items-center gap-1.5 bg-[#edf7f2] text-[#27644a] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">✓ Como funciona o acesso</div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">Acesso restrito e verificado.</h2>
          <p className="text-sm text-[#666] leading-relaxed mb-8">O PRECEPTOR.AI é exclusivo para médicos. Cada solicitação é revisada manualmente antes da liberação.</p>
          <div className="flex flex-col gap-5">
            {[
              { n:1, color:'#FCEBEB', text:'#E24B4A', title:'Você preenche o formulário', desc:'Nome, CRM e WhatsApp são suficientes para iniciar a análise.' },
              { n:2, color:'#FAEEDA', text:'#BA7517', title:'Revisamos seu CRM', desc:'Verificamos o registro no CFM para garantir uso por profissionais.' },
              { n:3, color:'#edf7f2', text:'#3d9b6e', title:'Acesso liberado via WhatsApp', desc:'Você recebe a confirmação no número informado em até 24h.' },
            ].map(s => (
              <div key={s.n} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: s.color, color: s.text }}>{s.n}</div>
                <div><div className="text-sm font-semibold mb-0.5">{s.title}</div><div className="text-xs text-[#666] leading-relaxed">{s.desc}</div></div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-white border border-[#e2e0d8] rounded-xl text-xs text-[#666] leading-relaxed">
            🔒 <strong className="text-[#1a1a1a]">Seus dados estão seguros.</strong><br />
            Usamos as informações exclusivamente para verificação de identidade.
          </div>
        </div>
      </div>
    </div>
  )
}
