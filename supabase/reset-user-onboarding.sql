-- Reset User Data for Onboarding - PostgreSQL (Supabase)
-- Execute cada query separadamente no Supabase SQL Editor

-- Substitua com seu endereço MetaMask
-- 0x13e01ad064df6358da8cc7bcf098208b2854ec4e

-- 1. Delete reward claims
DELETE FROM public.reward_claims 
WHERE wallet_address = '0x13e01ad064df6358da8cc7bcf098208b2854ec4e';

-- 2. Delete onboarding status
DELETE FROM public.onboarding_status 
WHERE wallet_address = '0x13e01ad064df6358da8cc7bcf098208b2854ec4e';

-- 3. Get user_id first (to delete transactions)
-- Copie o ID que retornar
SELECT id FROM public.users 
WHERE wallet_address = '0x13e01ad064df6358da8cc7bcf098208b2854ec4e';

-- 4. Delete transactions (use o user_id do resultado acima)
-- Se o user_id for 1a939ddf-7a1f-48e1-ac8d-918e9d153193:
DELETE FROM public.transactions 
WHERE buyer_id = '1a939ddf-7a1f-48e1-ac8d-918e9d153193' 
OR seller_id = '1a939ddf-7a1f-48e1-ac8d-918e9d153193';

-- 5. Delete products (opcional)
DELETE FROM public.products 
WHERE seller_wallet = '0x13e01ad064df6358da8cc7bcf098208b2854ec4e';

-- 6. Delete o usuário
DELETE FROM public.users 
WHERE wallet_address = '0x13e01ad064df6358da8cc7bcf098208b2854ec4e';

-- Verify - deve retornar vazio se tudo funcionou
SELECT * FROM public.users 
WHERE wallet_address = '0x13e01ad064df6358da8cc7bcf098208b2854ec4e';
