-- ============================================
-- ADD blockchain_product_id COLUMN
-- ============================================
-- Execute this in Supabase SQL Editor to add blockchain_product_id to products table

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS blockchain_product_id bigint;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_blockchain_id 
ON public.products(blockchain_product_id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'blockchain_product_id';
