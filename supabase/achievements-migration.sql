-- ============================================
-- ACHIEVEMENTS MIGRATION - ADICIONAR CAMPOS
-- ============================================
-- Execute este SQL no Supabase SQL Editor para adicionar os novos campos
-- de achievements às tabelas existentes

-- ============================================
-- 1. ADICIONAR CONTADORES E FLAGS NA TABELA onboarding_status
-- ============================================

-- Adicionar contadores de achievements
alter table public.onboarding_status 
add column if not exists listings_count integer default 0;

alter table public.onboarding_status 
add column if not exists sales_count integer default 0;

alter table public.onboarding_status 
add column if not exists purchases_count integer default 0;

-- Adicionar flags de rewards já reclamados
alter table public.onboarding_status 
add column if not exists first_listing_reward_claimed boolean default false;

alter table public.onboarding_status 
add column if not exists second_sale_reward_claimed boolean default false;

alter table public.onboarding_status 
add column if not exists second_purchase_reward_claimed boolean default false;

-- ============================================
-- 2. ATUALIZAR CONSTRAINT DA TABELA reward_claims
-- ============================================

-- Remover constraint antiga se existir
alter table public.reward_claims 
drop constraint if exists reward_claims_reward_type_check;

-- Adicionar nova constraint com tipos de reward expandidos
alter table public.reward_claims 
add constraint reward_claims_reward_type_check 
check (reward_type in ('onboarding', 'first_listing', 'second_sale', 'second_purchase'));

-- ============================================
-- 3. CRIAR FUNÇÕES PARA INCREMENTAR CONTADORES
-- ============================================

-- Função para incrementar contador de listings
create or replace function increment_listings_count(user_wallet text)
returns void
language plpgsql
security definer
as $$
declare
  user_uuid uuid;
begin
  -- Buscar user_id
  select id into user_uuid
  from public.users
  where wallet_address = lower(user_wallet);

  if user_uuid is null then
    raise exception 'User not found';
  end if;

  -- Incrementar contador
  update public.onboarding_status
  set listings_count = listings_count + 1,
      updated_at = now()
  where user_id = user_uuid;
end;
$$;

-- Função para incrementar contador de vendas
create or replace function increment_sales_count(seller_wallet text)
returns void
language plpgsql
security definer
as $$
declare
  user_uuid uuid;
begin
  -- Buscar user_id
  select id into user_uuid
  from public.users
  where wallet_address = lower(seller_wallet);

  if user_uuid is null then
    raise exception 'User not found';
  end if;

  -- Incrementar contador
  update public.onboarding_status
  set sales_count = sales_count + 1,
      updated_at = now()
  where user_id = user_uuid;
end;
$$;

-- Função para incrementar contador de compras
create or replace function increment_purchases_count(buyer_wallet text)
returns void
language plpgsql
security definer
as $$
declare
  user_uuid uuid;
begin
  -- Buscar user_id
  select id into user_uuid
  from public.users
  where wallet_address = lower(buyer_wallet);

  if user_uuid is null then
    raise exception 'User not found';
  end if;

  -- Incrementar contador
  update public.onboarding_status
  set purchases_count = purchases_count + 1,
      updated_at = now()
  where user_id = user_uuid;
end;
$$;

-- ============================================
-- 4. CRIAR FUNÇÃO PARA VERIFICAR ACHIEVEMENTS
-- ============================================

create or replace function get_user_achievements(user_wallet text)
returns table(
  listings_count integer,
  sales_count integer,
  purchases_count integer,
  can_claim_first_listing boolean,
  can_claim_second_sale boolean,
  can_claim_second_purchase boolean,
  first_listing_reward_claimed boolean,
  second_sale_reward_claimed boolean,
  second_purchase_reward_claimed boolean
)
language plpgsql
security definer
as $$
declare
  user_uuid uuid;
begin
  -- Buscar user_id
  select id into user_uuid
  from public.users
  where wallet_address = lower(user_wallet);

  if user_uuid is null then
    raise exception 'User not found';
  end if;

  -- Retornar achievements
  return query
  select 
    o.listings_count,
    o.sales_count,
    o.purchases_count,
    (o.listings_count >= 1 and not o.first_listing_reward_claimed) as can_claim_first_listing,
    (o.sales_count >= 2 and not o.second_sale_reward_claimed) as can_claim_second_sale,
    (o.purchases_count >= 2 and not o.second_purchase_reward_claimed) as can_claim_second_purchase,
    o.first_listing_reward_claimed,
    o.second_sale_reward_claimed,
    o.second_purchase_reward_claimed
  from public.onboarding_status o
  where o.user_id = user_uuid;
end;
$$;

-- ============================================
-- 5. COMENTÁRIOS
-- ============================================

comment on column public.onboarding_status.listings_count is 'Contador total de produtos listados pelo usuário';
comment on column public.onboarding_status.sales_count is 'Contador total de vendas completadas pelo usuário';
comment on column public.onboarding_status.purchases_count is 'Contador total de compras realizadas pelo usuário';
comment on column public.onboarding_status.first_listing_reward_claimed is 'Flag indicando se usuário já reclamou 10 GIRO do primeiro produto';
comment on column public.onboarding_status.second_sale_reward_claimed is 'Flag indicando se usuário já reclamou 20 GIRO da segunda venda';
comment on column public.onboarding_status.second_purchase_reward_claimed is 'Flag indicando se usuário já reclamou 20 GIRO da segunda compra';

comment on function increment_listings_count is 'Incrementa contador de produtos listados';
comment on function increment_sales_count is 'Incrementa contador de vendas completadas';
comment on function increment_purchases_count is 'Incrementa contador de compras realizadas';
comment on function get_user_achievements is 'Retorna achievements do usuário e flags de rewards disponíveis';
