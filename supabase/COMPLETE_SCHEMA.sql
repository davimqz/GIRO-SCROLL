-- ============================================
-- GIRO MARKETPLACE - COMPLETE SQL SCHEMA
-- ============================================
-- Execute este arquivo completo no Supabase SQL Editor
-- Ele cria todas as tabelas necessárias

-- ============================================
-- 1. EXTENSÕES
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- 2. TABELA USERS
-- ============================================
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text unique not null,
  email text,
  name text,
  profile_image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint wallet_address_lowercase check (wallet_address = lower(wallet_address))
);

create index if not exists idx_users_wallet on public.users(wallet_address);

-- ============================================
-- 3. TABELA ONBOARDING_STATUS
-- ============================================
create table if not exists public.onboarding_status (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  wallet_address text not null,
  step_wallet_connected boolean default false,
  step_profile_completed boolean default false,
  step_phone_verified boolean default false,
  step_reward_claimed boolean default false,
  reward_transaction_hash text,
  reward_claimed_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint wallet_address_lowercase check (wallet_address = lower(wallet_address))
);

create index if not exists idx_onboarding_user on public.onboarding_status(user_id);
create index if not exists idx_onboarding_wallet on public.onboarding_status(wallet_address);

-- ============================================
-- 4. TABELA REWARD_CLAIMS
-- ============================================
create table if not exists public.reward_claims (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  wallet_address text not null,
  reward_type text not null check (reward_type in ('onboarding', 'first_listing', 'second_sale', 'second_purchase')),
  amount numeric(78, 0) not null,
  transaction_hash text unique not null,
  block_number bigint,
  claimed_at timestamp with time zone default now(),
  constraint wallet_address_lowercase check (wallet_address = lower(wallet_address))
);

create index if not exists idx_reward_claims_user on public.reward_claims(user_id);
create index if not exists idx_reward_claims_wallet on public.reward_claims(wallet_address);
create index if not exists idx_reward_claims_type on public.reward_claims(reward_type);

-- ============================================
-- 5. TABELA PRODUCTS (COM blockchain_product_id)
-- ============================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.users(id) on delete cascade not null,
  seller_wallet text not null,
  title text not null,
  description text not null,
  price_giro numeric(78, 0) not null,
  condition text not null check (condition in ('new', 'like_new', 'good', 'fair', 'poor')),
  size text,
  category text,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'sold', 'inactive', 'deleted')),
  
  -- IMPORTANTE: Campo para linkar com blockchain
  blockchain_product_id bigint,
  
  views_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  sold_at timestamp with time zone,
  constraint min_images_check check (jsonb_array_length(images) >= 2 and jsonb_array_length(images) <= 4),
  constraint price_positive check (price_giro > 0),
  constraint wallet_address_lowercase check (seller_wallet = lower(seller_wallet))
);

create index if not exists idx_products_seller on public.products(seller_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_created on public.products(created_at desc);
create index if not exists idx_products_blockchain_id on public.products(blockchain_product_id);

-- ============================================
-- 6. TABELA TRANSACTIONS
-- ============================================
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete set null,
  buyer_id uuid references public.users(id) on delete set null not null,
  seller_id uuid references public.users(id) on delete set null not null,
  buyer_wallet text not null,
  seller_wallet text not null,
  amount_giro numeric(78, 0) not null,
  transaction_hash text unique not null,
  block_number bigint,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamp with time zone default now(),
  constraint wallet_addresses_lowercase check (
    buyer_wallet = lower(buyer_wallet) and 
    seller_wallet = lower(seller_wallet)
  )
);

create index if not exists idx_transactions_product on public.transactions(product_id);
create index if not exists idx_transactions_buyer on public.transactions(buyer_id);
create index if not exists idx_transactions_seller on public.transactions(seller_id);
create index if not exists idx_transactions_status on public.transactions(status);

-- ============================================
-- 7. VIEWS
-- ============================================

-- View: onboarding_dashboard
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

-- View: products_with_seller
create or replace view public.products_with_seller as
select
  p.id,
  p.seller_id,
  p.seller_wallet,
  u.name as seller_name,
  u.profile_image_url as seller_image,
  p.title,
  p.description,
  p.price_giro,
  p.condition,
  p.size,
  p.category,
  p.images,
  p.status,
  p.blockchain_product_id,
  p.views_count,
  p.created_at,
  p.updated_at,
  p.sold_at
from public.products p
left join public.users u on p.seller_id = u.id;

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

alter table public.users enable row level security;
alter table public.onboarding_status enable row level security;
alter table public.reward_claims enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;

-- RLS: USERS
create policy "Public profiles are viewable by everyone"
  on public.users for select using (true);
create policy "Users can insert their own profile"
  on public.users for insert with check (true);
create policy "Users can update their own profile"
  on public.users for update using (true) with check (true);

-- RLS: ONBOARDING_STATUS
create policy "Users can view their own onboarding status"
  on public.onboarding_status for select using (true);
create policy "Users can insert their own onboarding status"
  on public.onboarding_status for insert with check (true);
create policy "Users can update their own onboarding status"
  on public.onboarding_status for update using (true) with check (true);

-- RLS: REWARD_CLAIMS
create policy "Reward claims are viewable by everyone"
  on public.reward_claims for select using (true);
create policy "System can insert reward claims"
  on public.reward_claims for insert with check (true);

-- RLS: PRODUCTS
create policy "Products are viewable by everyone"
  on public.products for select using (true);
create policy "Users can insert their own products"
  on public.products for insert with check (true);
create policy "Users can update their own products"
  on public.products for update using (true) with check (true);

-- RLS: TRANSACTIONS
create policy "Transactions are viewable by everyone"
  on public.transactions for select using (true);
create policy "System can insert transactions"
  on public.transactions for insert with check (true);

-- ============================================
-- 9. FUNCTIONS E TRIGGERS
-- ============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.onboarding_status;
create trigger set_updated_at
  before update on public.onboarding_status
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.products;
create trigger set_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- ============================================
-- FIM DO SCHEMA COMPLETO
-- ============================================
-- ✅ Schema criado com sucesso!
