-- ============================================
-- STORAGE POLICIES - PRODUCT IMAGES
-- ============================================
-- Políticas para permitir upload e acesso às imagens

-- 1. Permitir upload de imagens (INSERT)
create policy "Anyone can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

-- 2. Permitir visualização de imagens (SELECT)
create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- 3. Permitir usuários atualizarem suas próprias imagens (UPDATE)
create policy "Users can update their own images"
  on storage.objects for update
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

-- 4. Permitir usuários deletarem suas próprias imagens (DELETE)
create policy "Users can delete their own images"
  on storage.objects for delete
  using (bucket_id = 'product-images');

-- ============================================
-- FIM DAS POLÍTICAS DE STORAGE
-- ============================================
-- ✅ Políticas criadas! Agora os uploads devem funcionar.
