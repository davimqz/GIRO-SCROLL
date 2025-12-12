# 🗄️ Supabase Setup - Giro Marketplace

## 📋 O que este schema faz?

Este schema cria toda a estrutura de banco de dados necessária para o Giro Marketplace:

- **Usuários** - Perfis e wallets
- **Onboarding Status** - Progresso do onboarding de cada usuário
- **Reward Claims** - Histórico de recompensas distribuídas
- **RLS Policies** - Segurança em nível de linha
- **Functions** - Helpers para validações e stats

## 🚀 Como instalar

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha:
   - **Name**: giro-marketplace (ou qualquer nome)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (ex: São Paulo)
4. Aguarde ~2 minutos para o projeto ser criado

### 2. Executar o schema

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Copie todo o conteúdo de `schema.sql`
4. Cole no editor e clique em **Run** (ou Ctrl+Enter)

✅ Você verá "Success. No rows returned" - isso é normal!

### 3. Verificar se funcionou

No menu lateral, clique em **Table Editor**. Você deve ver 3 tabelas:
- `users`
- `onboarding_status`
- `reward_claims`

### 4. Pegar as credenciais

1. Vá em **Settings** > **API** (menu lateral)
2. Copie:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (começa com `eyJ...`)

### 5. Adicionar no frontend

Edite `frontend/.env`:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Estrutura das Tabelas

### `users`
```sql
id                  uuid
wallet_address      text (unique, lowercase)
email               text
name                text
profile_image_url   text
created_at          timestamp
updated_at          timestamp
```

### `onboarding_status`
```sql
id                      uuid
user_id                 uuid (FK → users)
wallet_address          text
step_wallet_connected   boolean
step_profile_completed  boolean
step_phone_verified     boolean
step_reward_claimed     boolean
reward_transaction_hash text
reward_claimed_at       timestamp
completed_at            timestamp
created_at              timestamp
updated_at              timestamp
```

### `reward_claims`
```sql
id                uuid
user_id           uuid (FK → users)
wallet_address    text
reward_type       text ('onboarding', 'referral', etc)
amount            numeric(78,0) (50 GIRO = 50000000000000000000)
transaction_hash  text (unique)
block_number      bigint
claimed_at        timestamp
```

## 🔒 Segurança (RLS)

### Users
- ✅ Qualquer um pode **ler** perfis públicos
- ✅ Usuários podem **criar/editar** seu próprio perfil

### Onboarding Status
- ✅ Usuários podem **ler/criar/editar** seu próprio status
- ❌ Não podem ver status de outros usuários

### Reward Claims
- ✅ Qualquer um pode **ler** claims (transparência)
- ❌ Apenas sistema pode **criar** claims (via service role)

## 🛠️ Functions Úteis

### `has_claimed_onboarding_reward(wallet_address)`
Verifica se um wallet já reivindicou o reward de onboarding.

```sql
select has_claimed_onboarding_reward('0x742d35cc6634c0532925a3b844bc9e7595f0beb1');
-- Retorna: true ou false
```

### `get_system_stats()`
Retorna estatísticas do sistema.

```sql
select get_system_stats();
-- Retorna:
-- {
--   "total_users": 150,
--   "total_onboardings_completed": 120,
--   "total_rewards_claimed": 120,
--   "total_rewards_amount": "6000000000000000000000" (120 * 50 GIRO)
-- }
```

## 📈 View: `onboarding_dashboard`

Uma view consolidada para analytics:

```sql
select * from onboarding_dashboard
order by user_created_at desc
limit 10;
```

Retorna todos os dados relevantes de onboarding em uma única query.

## 🧪 Dados de Teste (Opcional)

Se quiser adicionar dados de teste, descomente a seção 10 do `schema.sql` antes de executar.

## 🔄 Updates Futuros

Para adicionar novas colunas ou tabelas no futuro:

1. Crie um novo arquivo `migrations/001_nome_da_migration.sql`
2. Execute no SQL Editor
3. Documente aqui no README

## 🐛 Troubleshooting

### "relation already exists"
Você já rodou o schema antes. Para resetar:

```sql
drop table if exists public.reward_claims cascade;
drop table if exists public.onboarding_status cascade;
drop table if exists public.users cascade;
drop view if exists public.onboarding_dashboard;
```

Depois execute o `schema.sql` novamente.

### "permission denied"
Certifique-se de estar usando o **service role key** no backend, não o anon key.

## 📚 Próximos Passos

1. ✅ Criar projeto Supabase
2. ✅ Executar schema.sql
3. ✅ Adicionar credenciais no .env
4. ⏳ Integrar no frontend com `@supabase/supabase-js`
5. ⏳ Implementar onboarding flow

---

**Dúvidas?** Consulte a [documentação do Supabase](https://supabase.com/docs)
