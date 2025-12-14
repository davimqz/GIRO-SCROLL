-- ============================================
-- ADD BLOCKCHAIN PRODUCT ID TO PRODUCTS TABLE
-- ============================================
-- Esta migração adiciona um campo para rastrear o ID do produto no blockchain

-- Adicionar coluna blockchain_product_id
alter table public.products 
add column if not exists blockchain_product_id bigint;

-- Criar índice para busca rápida
create index if not exists idx_products_blockchain_id on public.products(blockchain_product_id);

-- Commit da migração
-- Esta migração foi criada em 2025-12-14

-- INSTRUÇÕES:
-- 1. Execute este SQL no Supabase SQL Editor
-- 2. Quando listar um produto no blockchain, salve o ID retornado aqui
-- 3. Na compra, use este ID para chamar buyProduct() no smart contract
