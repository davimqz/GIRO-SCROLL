-- ============================================
-- DELETE PRODUCTS WITH NULL blockchain_product_id
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Isso deleta todos os produtos antigos que não têm blockchain_product_id

DELETE FROM public.products 
WHERE blockchain_product_id IS NULL;

-- Confirma quantos foram deletados
SELECT 'Produtos deletados com sucesso' as status;

-- Se quiser verificar os produtos restantes:
-- SELECT id, title, blockchain_product_id, status FROM public.products;
