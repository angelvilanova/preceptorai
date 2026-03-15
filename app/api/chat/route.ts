import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const AMBIENTE_CONTEXT: Record<string, string> = {
  upa: `O médico está em uma UPA com recursos limitados: sem UTI, sem hemodinâmica, sem especialistas presentes. Foque em estabilização inicial, doses práticas e critérios de transferência urgente.`,
  hospital: `O médico está em hospital geral com UTI disponível, especialistas de sobreaviso e recursos completos. Condutas completas são possíveis.`,
  terciario: `O médico está em hospital terciário com todos os recursos: UTI, hemodinâmica, neurocirurgia, especialistas presenciais.`,
}

export async function POST(req: NextRequest) {
  try {
    const { query, ambiente } = await req.json()

    if (!query) {
      return NextResponse.json({ error: 'Query obrigatória' }, { status: 400 })
    }

    const ambCtx = AMBIENTE_CONTEXT[ambiente as string] || AMBIENTE_CONTEXT.hospital

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
- Use siglas: SC, IV, IM, VO, mcg, mg, ml/h, NBZ
- Seja direto como um colega de plantão experiente
- Responda em português brasileiro`,
      messages: [{ role: 'user', content: query }],
    })

    const text = message.content
      .map((b: any) => b.type === 'text' ? b.text : '')
      .join('')

    return NextResponse.json({ reply: text })

  } catch (err: any) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}