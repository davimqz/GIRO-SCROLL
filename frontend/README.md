# Giro Frontend

Frontend React + Vite + TypeScript para o Giro Marketplace.

## Setup

```bash
npm install
```

## Configuração

Edite `src/config.ts` com os endereços dos contratos após fazer deploy:

```typescript
export const CONTRACT_ADDRESSES = {
  giroToken: "0x...", // Seu GiroToken
  giroMarketplace: "0x..." // Seu GiroMarketplace
};
```

## Dev

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Estrutura de Formulário

O formulário para criar posts agora inclui:
- **Foto** (obrigatória) - Upload com preview
- **Título** (máx 100 caracteres)
- **Descrição** (máx 500 caracteres)
- **Categoria** - Seleção entre: Arte, Música, Vídeo, Fotografia, Design, Outro
- **Preço em GIRO** - Valor do produto

## Fluxo

1. **Landing Page** → Conecta MetaMask
2. **Feed** → Lista todos os posts
3. **Criar Post** → Formulário completo com foto
4. **Minhas Compras** → Histórico de compras
5. **Perfil** → Em desenvolvimento

## Responsivo

100% responsivo para desktop e mobile com:
- Navbar adaptativa
- Layout em grid (desktop) / stack (mobile)
- Sidebar sticky de criar post (desktop)

## Pinata Integration (TODO)

Quando quiser integrar com Pinata para upload de imagens:

1. Obter API key do Pinata
2. Implementar upload em `CreatePost.tsx` função `uploadToIpfs`
3. Retornar IPFS hash do Pinata
