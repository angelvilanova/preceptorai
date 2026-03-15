import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role bypassa RLS — nunca expor no frontend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { nome, uf, crm, telefone, email, senha } = await req.json()

    // Validações básicas
    if (!nome || !uf || !crm || !telefone || !email || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
    }
    if (senha.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 8 caracteres.' }, { status: 400 })
    }

    // 1. Criar usuário no Auth (sem exigir confirmação de e-mail)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // confirma automaticamente, sem precisar de e-mail
      user_metadata: { nome },
    })

    if (authError) {
      const msg = authError.message.includes('already been registered')
        ? 'E-mail já cadastrado. Tente fazer login.'
        : authError.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 })
    }

    // 2. Inserir perfil com service role (bypassa RLS)
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      nome,
      crm,
      uf_crm: uf.toUpperCase(),
      telefone,
      email,
      status: 'pending',
      role: 'medico',
    })

    if (profileError) {
      // Rollback: deletar usuário se perfil falhou
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      console.error('Profile insert error:', profileError)
      return NextResponse.json({ error: 'Erro ao salvar perfil. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: authData.user.id })

  } catch (err) {
    console.error('Cadastro error:', err)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
