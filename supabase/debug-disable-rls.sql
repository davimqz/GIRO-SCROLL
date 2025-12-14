-- ============================================
-- TEMPORARY DEBUG: Disable RLS for products table
-- ============================================
-- This temporarily disables Row Level Security to test if RLS is the blocking issue

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- If this fixes the issue, then RLS policies need adjustment
-- After debugging, run:
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
