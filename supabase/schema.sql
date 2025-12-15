-- ============================================
-- GIRO MARKETPLACE - SUPABASE SCHEMA
-- ============================================
-- Este schema gerencia usuários, onboarding e recompensas
-- Deploy: Cole este SQL no Supabase SQL Editor

-- ============================================
-- 1. EXTENSÕES
-- ============================================
-- Habilita UUID para IDs únicos
create extension if not exists "uuid-ossp";

-- ============================================
-- 2. TABELA DE USUÁRIOS
-- ============================================
-- Armazena dados básicos dos usuários
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text unique not null,
  email text,
  name text,
  profile_image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Índices para performance
  constraint wallet_address_lowercase check (wallet_address = lower(wallet_address))
);

-- Índice para busca rápida por wallet
create index if not exists idx_users_wallet on public.users(wallet_address);

-- ============================================
-- 3. TABELA DE ONBOARDING STATUS
-- ============================================
-- Rastreia o progresso de onboarding de cada usuário
create table if not exists public.onboarding_status (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  wallet_address text not null,
  
  -- Etapas do onboarding
  step_wallet_connected boolean default false,
  step_profile_completed boolean default false,
  step_phone_verified boolean default false,
  step_reward_claimed boolean default false,
  
  -- Dados do reward
  reward_transaction_hash text,
  reward_claimed_at timestamp with time zone,
  
  -- Contadores de achievements para recompensas progressivas
  listings_count integer default 0,
  sales_count integer default 0,
  purchases_count integer default 0,
  
  -- Flags de rewards de achievements já reclamados
  first_listing_reward_claimed boolean default false,
  second_sale_reward_claimed boolean default false,
  second_purchase_reward_claimed boolean default false,
  
  -- Metadata
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Um registro de onboarding por usuário
  constraint onboarding_status_user_unique unique(user_id),
  constraint wallet_address_lowercase check (wallet_address = lower(wallet_address))
);

-- Índices para performance
create index if not exists idx_onboarding_user on public.onboarding_status(user_id);
create index if not exists idx_onboarding_wallet on public.onboarding_status(wallet_address);

-- ============================================
-- 4. TABELA DE LOGS DE RECOMPENSAS
-- ============================================
-- Histórico de todas as recompensas distribuídas
create table if not exists public.reward_claims (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  wallet_address text not null,
  reward_type text not null check (reward_type in ('onboarding', 'first_listing', 'second_sale', 'second_purchase')),
  amount numeric(78, 0) not null, -- Em wei (18 decimals): 50 GIRO = 50000000000000000000
  transaction_hash text unique not null,
  block_number bigint,
  claimed_at timestamp with time zone default now(),
  
  constraint wallet_address_lowercase check (wallet_address = lower(wallet_address))
);

-- Índices para queries e analytics
create index if not exists idx_reward_claims_user on public.reward_claims(user_id);
create index if not exists idx_reward_claims_wallet on public.reward_claims(wallet_address);
create index if not exists idx_reward_claims_type on public.reward_claims(reward_type);
create index if not exists idx_reward_claims_date on public.reward_claims(claimed_at);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilita RLS em todas as tabelas
alter table public.users enable row level security;
alter table public.onboarding_status enable row level security;
alter table public.reward_claims enable row level security;

-- ============================================
-- 5.1 POLICIES - USERS
-- ============================================

-- Qualquer um pode ler perfis públicos
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using (true);

-- Usuários podem inserir seu próprio perfil
create policy "Users can insert their own profile"
  on public.users for insert
  with check (true);

-- Usuários podem atualizar seu próprio perfil
create policy "Users can update their own profile"
  on public.users for update
  using (true)
  with check (true);

-- ============================================
-- 5.2 POLICIES - ONBOARDING_STATUS
-- ============================================

-- Usuários podem ver seu próprio status
create policy "Users can view their own onboarding status"
  on public.onboarding_status for select
  using (true);

-- Usuários podem criar seu próprio status
create policy "Users can insert their own onboarding status"
  on public.onboarding_status for insert
  with check (true);

-- Usuários podem atualizar seu próprio status
create policy "Users can update their own onboarding status"
  on public.onboarding_status for update
  using (true)
  with check (true);

-- ============================================
-- 5.3 POLICIES - REWARD_CLAIMS
-- ============================================

-- Qualquer um pode ver todos os claims (para transparência)
create policy "Reward claims are viewable by everyone"
  on public.reward_claims for select
  using (true);

-- Apenas sistema pode inserir claims (via service role)
create policy "Only system can insert reward claims"
  on public.reward_claims for insert
  with check (true);

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Função para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para updated_at
drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.onboarding_status;
create trigger set_updated_at
  before update on public.onboarding_status
  for each row execute function public.handle_updated_at();

-- ============================================
-- 7. FUNÇÃO PARA VERIFICAR SE USUÁRIO JÁ CLAIMOU
-- ============================================
create or replace function public.has_claimed_onboarding_reward(p_wallet_address text)
returns boolean as $$
begin
  return exists (
    select 1
    from public.onboarding_status
    where lower(wallet_address) = lower(p_wallet_address)
    and step_reward_claimed = true
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- 8. FUNÇÃO PARA OBTER STATS DO SISTEMA
-- ============================================
create or replace function public.get_system_stats()
returns json as $$
declare
  stats json;
begin
  select json_build_object(
    'total_users', (select count(*) from public.users),
    'total_onboardings_completed', (select count(*) from public.onboarding_status where completed_at is not null),
    'total_rewards_claimed', (select count(*) from public.reward_claims),
    'total_rewards_amount', (select coalesce(sum(amount), 0) from public.reward_claims)
  ) into stats;
  
  return stats;
end;
$$ language plpgsql security definer;

-- ============================================
-- 9. VIEW PARA DASHBOARD
-- ============================================
create or replace view public.onboarding_dashboard as
select
  u.id,
  u.wallet_address,
  u.name,
  u.email,
  u.created_at as user_created_at,
  os.step_wallet_connected,
  os.step_profile_completed,
  os.step_phone_verified,
  os.step_reward_claimed,
  os.reward_claimed_at,
  os.completed_at as onboarding_completed_at,
  rc.amount as reward_amount,
  rc.transaction_hash as reward_tx_hash
from public.users u
left join public.onboarding_status os on u.id = os.user_id
left join public.reward_claims rc on u.id = rc.user_id and rc.reward_type = 'onboarding';

-- ============================================
-- 10. DADOS DE TESTE (OPCIONAL)
-- ============================================
-- Descomente para adicionar dados de teste

/*
-- Usuário de teste 1 (onboarding completo)
insert into public.users (wallet_address, email, name) values
  ('0x742d35cc6634c0532925a3b844bc9e7595f0beb1', 'alice@example.com', 'Alice');

insert into public.onboarding_status (user_id, wallet_address, step_wallet_connected, step_profile_completed, step_phone_verified, step_reward_claimed, completed_at) values
  ((select id from public.users where wallet_address = '0x742d35cc6634c0532925a3b844bc9e7595f0beb1'), '0x742d35cc6634c0532925a3b844bc9e7595f0beb1', true, true, true, true, now());

-- Usuário de teste 2 (onboarding em progresso)
insert into public.users (wallet_address, email, name) values
  ('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199', 'bob@example.com', 'Bob');

insert into public.onboarding_status (user_id, wallet_address, step_wallet_connected, step_profile_completed) values
  ((select id from public.users where wallet_address = '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199'), '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199', true, true);
*/

-- ============================================
-- FIM DO SCHEMA
-- ============================================
-- ✅ Schema criado com sucesso!
-- 
-- Próximos passos:
-- 1. Execute este SQL no Supabase SQL Editor
-- 2. Pegue as credenciais (URL + Anon Key) do projeto
-- 3. Adicione ao frontend/.env:
--    VITE_SUPABASE_URL=your-project-url
--    VITE_SUPABASE_ANON_KEY=your-anon-key
