'use client'
import { useState, useRef, useEffect } from 'react'
import { parseLocal } from '@/lib/clinicalKB'
import type { Ambiente } from '@/lib/protocols'

interface Message { role: 'user' | 'ai'; text: string }

const QUICK = [
  'Dose adrenalina anafilaxia',
  'Noradrenalina 70kg',
  'Midazolam intubação 80kg',
  'Insulina glicemia 380',
  'Conduta sepse',
  'AVC isquêmico',
]

export function ChatModule({ ambiente }: { ambiente: Ambiente }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Olá. Escreva sua dúvida diretamente.\n\nExemplos: **dose adrenalina**, **noradrenalina 70kg**, **midazolam intubação 80kg**, **conduta sepse**' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(query?: string) {
    const q = (query || input).trim()
    if (!q || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)

    // Tentar resposta local primeiro
    const local = parseLocal(q)
    if (local) {
      await new Promise(r => setTimeout(r, 250))
      setMessages(m => [...m, { role: 'ai', text: local }])
      setLoading(false)
      return
    }

    // Fallback para API
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, ambiente }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'ai', text: data.reply || 'Erro na resposta.' }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: '⚠️ Erro de conexão. Tente novamente.' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Quick chips */}
      <div className="flex gap-2 flex-wrap px-4 py-2.5 border-b border-[#e2e0d8] bg-white">
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)}
            className="text-xs px-3 py-1.5 border border-[#e2e0d8] rounded-full text-[#666] hover:bg-[#f7f6f3] hover:text-[#1a1a1a] hover:border-[#ccc] transition-all">
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] text-sm px-4 py-3 rounded-2xl leading-relaxed whitespace-pre-wrap
              ${m.role === 'user'
                ? 'bg-[#E24B4A] text-white rounded-br-sm'
                : 'bg-white border border-[#e2e0d8] text-[#1a1a1a] rounded-tl-sm'
              }`}
              dangerouslySetInnerHTML={{ __html: formatMsg(m.text) }}
            />
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#e2e0d8] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#ccc] animate-bounce"
                    style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#e2e0d8] bg-white flex gap-2">
        <input
          className="flex-1 border border-[#e2e0d8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E24B4A] bg-[#f7f6f3] focus:bg-white transition-all placeholder:text-[#aaa]"
          placeholder="Ex: midazolam intubação 80kg..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="w-10 h-10 bg-[#E24B4A] rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40">
          <svg viewBox="0 0 17 17" fill="none" className="w-4 h-4">
            <path d="M15 8.5L2 3l3.5 5.5L2 14l13-5.5z" fill="white"/>
          </svg>
        </button>
      </div>

      <div className="text-center text-xs text-[#ccc] py-1.5 bg-white border-t border-[#f0ede4]">
        ⚡ Respostas locais instantâneas · IA para consultas avançadas
      </div>
    </div>
  )
}

function formatMsg(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<code class="block bg-[#f7f6f3] border border-[#e2e0d8] rounded-lg px-3 py-2 mt-2 text-xs font-mono leading-loose whitespace-pre">$1</code>')
}
