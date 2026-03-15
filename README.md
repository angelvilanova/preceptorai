# PRECEPTOR.AI

Copiloto clínico para médicos em plantão. Next.js + Supabase + Anthropic.

## Setup em 5 passos

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env.local` já contém as credenciais do Supabase.
Adicione sua chave da Anthropic e a service role key:

```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_SERVICE_ROLE_KEY=...  # Em Settings > API no dashboard do Supabase
```

### 3. Criar as tabelas no Supabase

Acesse https://sryusfhapsefkowrtuyb.supabase.co
→ SQL Editor → New query → cole o conteúdo de `supabase-schema.sql` → Run

### 4. Criar seu usuário admin

- Acesse o app em `/cadastro` e crie sua conta
- No Supabase SQL Editor, execute:
```sql
UPDATE public.profiles SET role = 'admin', status = 'approved' WHERE email = 'seu@email.com';
```

### 5. Rodar o projeto

```bash
npm run dev
# Acesse http://localhost:3000
```

## Estrutura

```
app/
  login/          → Tela de login
  cadastro/       → Solicitação de acesso
  pendente/       → Aguardando aprovação
  dashboard/      → App principal (chat + calculadora + protocolos)
  admin/          → Painel de aprovação de médicos
  api/chat/       → API route que chama a Anthropic (chave segura no servidor)

components/
  BrandLogo.tsx   → Logo compartilhado
  RightPanel.tsx  → Painel direito das telas de auth

lib/supabase/
  client.ts       → Supabase client (browser)
  server.ts       → Supabase client (server/API routes)

middleware.ts     → Proteção de rotas e verificação de aprovação
```

## Fluxo de usuário

1. Médico acessa `/cadastro` → preenche nome, CRM, WhatsApp, email, senha
2. Conta criada com `status: pending`
3. Admin acessa `/admin` → aprova o médico
4. Médico consegue acessar `/dashboard`

## Deploy (Vercel)

```bash
npx vercel
```

Adicionar as variáveis de ambiente no painel da Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
