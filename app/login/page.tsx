'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BrandLogo } from '@/components/BrandLogo'
import { RightPanel } from '@/components/RightPanel'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !senha) { setError('Preencha e-mail e senha.'); return }
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (authError) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Erro inesperado.'); setLoading(false); return }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single() as { data: any; error: any }

    // Mostrar debug na tela
    setDebugInfo(`ID: ${user.id} | Profile: ${JSON.stringify(profile)} | Error: ${profileError?.message}`)
    setLoading(false)

    if (!profile || profile.status !== 'approved') {
      return // Não redireciona ainda — mostra o debug
    }

    if (profile.role === 'admin') {
      window.location.href = '/admin'
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-[420px] min-w-[420px] bg-white border-r border-[#e2e0d8] flex flex-col p-12">
        <BrandLogo />
        <h1 className="text-2xl font-bold tracking-tight mb-1.5">Bom plantão 👋</h1>
        <p className="text-sm text-[#666] mb-8 leading-relaxed">Acesse sua conta para continuar.</p>

        {error && (
          <div className="bg-[#FCEBEB] text-[#791F1F] border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        {debugInfo && (
          <div className="bg-black text-green-400 rounded-xl p-3 text-xs font-mono mb-5 break-all">
            {debugInfo}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="form-label">E-mail</label>
            <input className="form-input" type="email" placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label className="form-label">Senha</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={senha} onChange={e => setSenha(e.target.value)} autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary mt-1 flex items-center justify-center gap-2">
            {loading
              ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              : 'Entrar'
            }
          </button>
        </form>

        <p className="text-center text-sm text-[#666] mt-5">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-[#E24B4A] font-semibold hover:underline">
            Solicitar acesso
          </Link>
        </p>

        <div className="mt-auto pt-8 text-xs text-[#bbb] bg-[#f7f6f3] rounded-xl p-3 leading-relaxed">
          <strong className="text-[#999]">Área administrativa</strong><br/>
          Aprovação de médicos em{' '}
          <Link href="/admin" className="text-[#999] hover:underline">admin</Link>
        </div>
      </div>
      <RightPanel />
    </div>
  )
}