-- ================================================================
-- PRECEPTOR.AI — Schema FINAL corrigido
-- Execute TODO este arquivo no Supabase SQL Editor
-- ================================================================


-- ================================================================
-- PARTE 1 — LIMPEZA COMPLETA
-- ================================================================

DROP TABLE IF EXISTS public.chat_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP VIEW  IF EXISTS public.admin_profiles_view CASCADE;

DROP FUNCTION IF EXISTS public.handle_user_login() CASCADE;


-- ================================================================
-- PARTE 2 — TABELA PROFILES
-- ================================================================

CREATE TABLE public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome         TEXT        NOT NULL,
  crm          TEXT        NOT NULL,
  uf_crm       CHAR(2)     NOT NULL,
  telefone     TEXT        NOT NULL,
  email        TEXT        NOT NULL UNIQUE,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
  role         TEXT        NOT NULL DEFAULT 'medico'
                           CHECK (role IN ('medico', 'admin')),
  ambiente     TEXT        NOT NULL DEFAULT 'upa'
                           CHECK (ambiente IN ('upa', 'hospital')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at  TIMESTAMPTZ,
  rejected_at  TIMESTAMPTZ,
  last_login   TIMESTAMPTZ
);

CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_email  ON public.profiles(email);


-- ================================================================
-- PARTE 3 — RLS CORRIGIDA
-- O ponto crítico: qualquer usuário autenticado deve conseguir
-- ler o PRÓPRIO perfil — independente de role ou status.
-- O INSERT é feito sempre via service_role (API route), que
-- bypassa RLS automaticamente.
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado lê o próprio perfil
CREATE POLICY "select_own_profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Qualquer usuário autenticado atualiza o próprio perfil
CREATE POLICY "update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin lê TODOS os perfis
-- Usa uma subquery segura que não entra em loop recursivo
CREATE POLICY "admin_select_all_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admin atualiza TODOS os perfis (aprovar/rejeitar)
CREATE POLICY "admin_update_all_profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ================================================================
-- PARTE 4 — TABELA CHAT LOGS
-- ================================================================

CREATE TABLE public.chat_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query      TEXT        NOT NULL,
  reply      TEXT        NOT NULL,
  fonte      TEXT        NOT NULL DEFAULT 'local'
                         CHECK (fonte IN ('local', 'ai')),
  ambiente   TEXT        NOT NULL DEFAULT 'upa'
                         CHECK (ambiente IN ('upa', 'hospital')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_logs_user_id ON public.chat_logs(user_id);
CREATE INDEX idx_chat_logs_created ON public.chat_logs(created_at DESC);

ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_logs_own"
  ON public.chat_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "chat_logs_admin"
  ON public.chat_logs FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ================================================================
-- PARTE 5 — FUNÇÃO: atualizar last_login
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE public.profiles
  SET last_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_login();


-- ================================================================
-- PARTE 6 — VIEW ADMIN
-- ================================================================

CREATE OR REPLACE VIEW public.admin_profiles_view AS
SELECT
  p.id,
  p.nome,
  p.crm,
  p.uf_crm,
  p.telefone,
  p.email,
  p.status,
  p.role,
  p.ambiente,
  p.created_at,
  p.approved_at,
  p.last_login,
  (SELECT COUNT(*) FROM public.chat_logs cl WHERE cl.user_id = p.id) AS total_consultas
FROM public.profiles p;

GRANT SELECT ON public.admin_profiles_view TO service_role;
GRANT SELECT ON public.admin_profiles_view TO authenticated;


-- ================================================================
-- PARTE 7 — VERIFICAÇÃO
-- Deve listar as colunas das 2 tabelas
-- ================================================================

SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'chat_logs')
ORDER BY table_name, ordinal_position;


-- ================================================================
-- PARTE 8 — CRIAR ADMIN
-- Execute APÓS se cadastrar pelo /cadastro
-- Substitua o e-mail e rode este bloco separadamente
-- ================================================================

/*
UPDATE public.profiles
SET
  role        = 'admin',
  status      = 'approved',
  approved_at = NOW()
WHERE email = 'seu@email.com';

-- Confirmar:
SELECT id, nome, email, role, status, approved_at
FROM public.profiles
WHERE email = 'seu@email.com';
*/
