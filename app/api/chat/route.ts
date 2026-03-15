import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const AMBIENTE_CONTEXT: Record<string, string> = {
  upa: `O médico está em uma UPA (Unidade de Pronto Atendimento) com recursos limitados: sem UTI, sem hemodinâmica, sem especialistas presentes. Foque em: estabilização inicial, doses práticas, critérios de transferência urgente para hospital. Mencione quando o paciente deve ser transferido.`,
  hospital: `O médico está em um hospital geral com UTI disponível, especialistas de sobreaviso, recursos laboratoriais e de imagem. Condutas completas são possíveis.`,
  terciario: `O médico está em hospital terciário/universitário com todos os recursos: UTI, hemodinâmica, neurocirurgia, transplante, especialistas presenciais. Pode incluir condutas avançadas.`,
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('status').eq('id', user.id).single()
  if (profile?.status !== 'approved')
    return NextResponse.json({ error: 'Acesso pendente' }, { status: 403 })

  const { query, ambiente } = await req.json()
  if (!query) return NextResponse.json({ error: 'Query obrigatória' }, { status: 400 })

  const ambCtx = AMBIENTE_CONTEXT[ambiente] || AMBIENTE_CONTEXT.hospital

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 900,
    system: `Você é PRECEPTOR.AI, copiloto clínico para médicos em plantão no Brasil. Responda de forma EXTREMAMENTE concisa e direta.

CONTEXTO DO AMBIENTE: ${ambCtx}

FORMATO OBRIGATÓRIO:
- Doses: nome em negrito, dose, via, frequência (máx 3 linhas)
- Protocolos: lista numerada, máx 7 etapas, 1 linha cada
- Cálculos com peso: mostrar resultado calculado em destaque
- Nunca disclaimers médico-legais
- Use siglas: SC, IV, IM, VO, mcg, mg, ml/h, NBZ, IC, SNE
- Referência rápida de diretriz se relevante (ex: "SBC 2024")
- Seja direto como um colega de plantão experiente
- Responda em português brasileiro`,
    messages: [{ role: 'user', content: query }],
  })

  const text = message.content.map(b => b.type === 'text' ? b.text : '').join('')
  return NextResponse.json({ reply: text })
}
