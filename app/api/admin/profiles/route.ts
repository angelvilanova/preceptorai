import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') || 'pending'
  const { data, error } = await supabaseAdmin
    .from('profiles').select('*').eq('status', status).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profiles: data })
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id e status obrigatórios' }, { status: 400 })
  const update: Record<string, any> = { status }
  if (status === 'approved') update.approved_at = new Date().toISOString()
  if (status === 'rejected') update.rejected_at = new Date().toISOString()
  const { error } = await supabaseAdmin.from('profiles').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
