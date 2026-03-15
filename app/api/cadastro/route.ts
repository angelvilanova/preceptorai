import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role bypassa RLS — nunca expor no frontend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function clean(value: unknown) {
  return String(value ?? '').trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const nome = clean(body.nome)
    const uf = clean(body.uf).toUpperCase()
    const crm = clean(body.crm).replace(/\D/g, '')
    const telefone = clean(body.telefone)
    const email = clean(body.email).toLowerCase()
    const senha = String(body.senha ?? '')

    // Validações básicas
    if (!nome || !uf || !crm || !telefone || !email || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
    }
    if (uf.length !== 2) {
      return NextResponse.json({ error: 'UF inválida (ex: SP).' }, { status: 400 })
    }
    if (senha.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 8 caracteres.' }, { status: 400 })
    }

    // 1. Criar usuário no Auth (sem exigir confirmação de e-mail)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome,
        crm,
        uf_crm: uf,
        telefone,
      },
    })

    if (authError) {
      const msg = authError.message.toLowerCase().includes('already been registered')
        ? 'E-mail já cadastrado. Tente fazer login.'
        : authError.message.toLowerCase().includes('database error creating new user')
          ? 'Não foi possível concluir o cadastro agora. Verifique se o e-mail e CRM já não estão cadastrados e tente novamente.'
          : 'Erro ao criar usuário. Tente novamente.'

      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 })
    }

    // 2. Upsert do perfil: evita falha caso exista trigger no projeto que já insere em `profiles`
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: authData.user.id,
      nome,
      crm,
      uf_crm: uf,
      telefone,
      email,
      status: 'pending',
      role: 'medico',
    }, { onConflict: 'id' })

    if (profileError) {
      // Rollback: deletar usuário se perfil falhou
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      console.error('Profile upsert error:', profileError)
      return NextResponse.json({ error: 'Erro ao salvar perfil. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (err) {
    console.error('Cadastro error:', err)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
