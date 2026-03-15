import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { query, ambiente } = await req.json()
    if (!query) return NextResponse.json({ error: 'Query obrigatoria' }, { status: 400 })

    const ctx: Record<string, string> = {
      upa: 'UPA: sem UTI, sem hemodinamica. Foque em estabilizacao e transferencia.',
      hospital: 'Hospital geral com UTI e especialistas disponíveis.',
      terciario: 'Hospital terciario com todos os recursos.',
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 900,
      system: `Voce e PRECEPTOR.AI, copiloto clinico para medicos em plantao no Brasil. Seja EXTREMAMENTE conciso. Ambiente: ${ctx[ambiente] || ctx.hospital}. Responda em portugues. Sem disclaimers. Use siglas medicas padrao.`,
      messages: [{ role: 'user', content: query }],
    })

    const text = message.content.map((b: any) => b.type === 'text' ? b.text : '').join('')
    return NextResponse.json({ reply: text })

  } catch (err: any) {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}