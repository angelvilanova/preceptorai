'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PendentePage() {
  const [nome, setNome] = useState('')
  const [crm, setCrm] = useState('')
  const [tel, setTel] = useState('')

  useEffect(() => {
    setNome(sessionStorage.getItem('cad_nome') || '')
    setCrm(sessionStorage.getItem('cad_crm') || '')
    setTel(sessionStorage.getItem('cad_tel') || '')
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center p-8">
      <div className="bg-white border border-[#e2e0d8] rounded-2xl p-12 max-w-[440px] w-full text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#FAEEDA] flex items-center justify-center text-3xl mx-auto mb-6">⏳</div>

        <h1 className="text-xl font-bold mb-2">Solicitação enviada!</h1>
        <p className="text-sm text-[#666] leading-relaxed mb-7">
          Recebemos seu cadastro. Você será notificado pelo WhatsApp assim que o acesso for liberado.
        </p>

        <div className="bg-[#FAEEDA] border border-[#f0d89a] rounded-xl p-4 text-sm text-[#BA7517] mb-5 text-left leading-relaxed">
          <strong className="text-[#7a5010]">O que acontece agora?</strong><br/>
          Nossa equipe verifica seu CRM no CFM e libera o acesso em até <strong>24 horas</strong>. Fique de olho no WhatsApp.
        </div>

        {nome && (
          <div className="bg-[#f7f6f3] border border-[#e2e0d8] rounded-xl p-4 text-left mb-6">
            {[['Nome', nome], ['CRM', crm], ['WhatsApp', tel]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 text-sm border-b border-[#f0ede4] last:border-0">
                <span className="text-[#aaa]">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-[#aaa]">Status</span>
              <span className="font-semibold text-[#BA7517]">⏳ Aguardando aprovação</span>
            </div>
          </div>
        )}

        <button onClick={handleLogout}
          className="w-full py-2.5 border border-[#E24B4A] text-[#E24B4A] rounded-xl text-sm font-semibold hover:bg-[#FCEBEB] transition-colors">
          ← Voltar para o login
        </button>
      </div>
    </div>
  )
}