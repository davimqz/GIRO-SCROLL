-- ============================================
-- MARKETPLACE - PRODUCTS SCHEMA
-- ============================================
-- Este schema gerencia produtos do marketplace

-- ============================================
-- 1. TABELA DE PRODUTOS
-- ============================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  
  -- Relacionamento com usuário
  seller_id uuid references public.users(id) on delete cascade not null,
  seller_wallet text not null,
  
  -- Informações básicas do produto
  title text not null,
  description text not null,
  
  -- Preço em GIRO tokens (armazenado em wei, 18 decimals)
  price_giro numeric(78, 0) not null,
  
  -- Detalhes do produto
  condition text not null check (condition in ('new', 'like_new', 'good', 'fair', 'poor')),
  size text, -- XS, S, M, L, XL, etc
  category text, -- Para futuro: 'electronics', 'clothing', 'home', etc
  
  -- Imagens (URLs do Supabase Storage ou CDN)
  images jsonb not null default '[]'::jsonb, -- Array de URLs
  
  -- Status do produto
  status text not null default 'active' check (status in ('active', 'sold', 'inactive', 'deleted')),
  
  -- Metadata
  views_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  sold_at timestamp with time zone,
  
  -- Índices
  constraint min_images_check check (jsonb_array_length(images) >= 2 and jsonb_array_length(images) <= 4),
  constraint price_positive check (price_giro > 0),
  constraint wallet_address_lowercase check (seller_wallet = lower(seller_wallet))
);

-- Índices para performance
create index if not exists idx_products_seller on public.products(seller_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_created on public.products(created_at desc);
create index if not exists idx_products_price on public.products(price_giro);

-- ============================================
-- 2. TABELA DE TRANSAÇÕES
-- ============================================
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  
  -- Relacionamentos
  product_id uuid references public.products(id) on delete set null,
  buyer_id uuid references public.users(id) on delete set null not null,
  seller_id uuid references public.users(id) on delete set null not null,
  
  buyer_wallet text not null,
  seller_wallet text not null,
  
  -- Detalhes da transação
  amount_giro numeric(78, 0) not null,
  transaction_hash text unique not null,
  block_number bigint,
  
  -- Status
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'refunded')),
  
  -- Metadata
  created_at timestamp with time zone default now(),
  
  constraint wallet_addresses_lowercase check (
    buyer_wallet = lower(buyer_wallet) and 
    seller_wallet = lower(seller_wallet)
  )
);

-- Índices para queries
create index if not exists idx_transactions_buyer on public.transactions(buyer_id);
create index if not exists idx_transactions_seller on public.transactions(seller_id);
create index if not exists idx_transactions_product on public.transactions(product_id);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_date on public.transactions(created_at desc);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

alter table public.products enable row level security;
alter table public.transactions enable row level security;

-- Products Policies
create policy "Anyone can view active products"
  on public.products for select
  using (status = 'active' or status = 'sold');

create policy "Sellers can create products"
  on public.products for insert
  with check (true);

create policy "Sellers can update their own products"
  on public.products for update
  using (seller_id = (select id from public.users where wallet_address = lower(auth.jwt()->>'wallet_address')))
  with check (seller_id = (select id from public.users where wallet_address = lower(auth.jwt()->>'wallet_address')));

create policy "Sellers can delete their own products"
  on public.products for delete
  using (seller_id = (select id from public.users where wallet_address = lower(auth.jwt()->>'wallet_address')));

-- Transactions Policies
create policy "Users can view their own transactions"
  on public.transactions for select
  using (
    buyer_id = (select id from public.users where wallet_address = lower(auth.jwt()->>'wallet_address')) or
    seller_id = (select id from public.users where wallet_address = lower(auth.jwt()->>'wallet_address'))
  );

create policy "Anyone can create transactions"
  on public.transactions for insert
  with check (true);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Função para incrementar views
create or replace function public.increment_product_views(product_uuid uuid)
returns void as $$
begin
  update public.products
  set views_count = views_count + 1
  where id = product_uuid;
end;
$$ language plpgsql security definer;

-- Função para marcar produto como vendido
create or replace function public.mark_product_as_sold(
  product_uuid uuid,
  tx_hash text,
  buyer_uuid uuid,
  amount numeric
)
returns void as $$
begin
  -- Atualiza status do produto
  update public.products
  set status = 'sold', sold_at = now()
  where id = product_uuid;
  
  -- Cria registro de transação
  insert into public.transactions (
    product_id,
    buyer_id,
    seller_id,
    buyer_wallet,
    seller_wallet,
    amount_giro,
    transaction_hash,
    status
  )
  select
    product_uuid,
    buyer_uuid,
    p.seller_id,
    (select wallet_address from public.users where id = buyer_uuid),
    p.seller_wallet,
    amount,
    tx_hash,
    'completed'
  from public.products p
  where p.id = product_uuid;
end;
$$ language plpgsql security definer;

-- Função para obter estatísticas do marketplace
create or replace function public.get_marketplace_stats()
returns json as $$
declare
  stats json;
begin
  select json_build_object(
    'total_products', (select count(*) from public.products where status = 'active'),
    'total_sold', (select count(*) from public.products where status = 'sold'),
    'total_transactions', (select count(*) from public.transactions where status = 'completed'),
    'total_volume_giro', (select coalesce(sum(amount_giro), 0) from public.transactions where status = 'completed')
  ) into stats;
  
  return stats;
end;
$$ language plpgsql security definer;

-- ============================================
-- 5. VIEW PARA PRODUTOS COM VENDEDOR
-- ============================================
create or replace view public.products_with_seller as
select
  p.*,
  u.name as seller_name,
  u.wallet_address as seller_wallet_full,
  (select count(*) from public.transactions t where t.seller_id = p.seller_id and t.status = 'completed') as seller_sales_count
from public.products p
join public.users u on p.seller_id = u.id;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
-- ✅ Schema de produtos criado com sucesso!
-- 
-- Próximos passos:
-- 1. Execute este SQL no Supabase SQL Editor
-- 2. Configure o Supabase Storage para imagens
-- 3. Implemente o formulário de criação de produtos
