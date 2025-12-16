# 🌍 Giro - Marketplace Descentralizado Web3

Uma plataforma inovadora para economia circular, permitindo que usuários comprem, vendam e troquem itens digitais usando tokens **GIRO** na blockchain Ethereum Sepolia.

**Site ao vivo:** [https://giro-qi68d6qaa-davimqzs-projects-87ed2724.vercel.app](https://giro-qi68d6qaa-davimqzs-projects-87ed2724.vercel.app)

---

## ✨ Features

### 🎯 Funcionalidades Principais
- **Marketplace Descentralizado**: Compre e venda itens de forma segura e transparente
- **Tokens GIRO**: Sistema de recompensas e pagamentos em cripto
- **IPFS/Pinata Integration**: Upload de imagens descentralizado
- **Onboarding Reward**: Receba 50 GIRO tokens ao se registrar
- **Soulbound Tokens**: Planos premium com certificados digitais (SBT)
- **Responsive Design**: Interface otimizada para mobile e desktop
- **MetaMask Integration**: Conecte sua wallet Web3 facilmente

### 📋 Seções da Landing Page
- **Hero Section**: Visão geral da economia circular
- **Como Funciona**: Tutorial em 3 passos (Anuncie → Conecte → Reutilize)
- **Planos Premium**: 2 planos com benefícios exclusivos
- **Footer**: Links importantes e redes sociais

### 💳 Planos
| Plano | Preço | Benefícios |
|-------|-------|-----------|
| **Plano 01** | $6,99/mês | Soulbound Token (SBTL) + Prioridade no Chat + Ajude o Projeto |
| **Plano 02** | $19,99/mês | Tudo do Plano 01 + Comunidade Instagram + Trocas Ilimitadas |

---

## 🛠 Stack Tecnológico

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Styling utility-first
- **ethers.js v6** - Web3 integration
- **Pinata API** - IPFS file storage

### Smart Contracts
- **Solidity ^0.8.24**
- **OpenZeppelin** - Standard ERC-20 implementation
- **Hardhat** - Development environment
- **Ethereum Sepolia Testnet** - Network

### Deployment & Hosting
- **Vercel** - Frontend hosting
- **Sepolia Testnet** - Smart contracts

---

## 📦 Estrutura do Projeto

```
GIRO-SCROLL/
├── frontend/                          # React TypeScript application
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── LandingPage.tsx       # Landing page com todas as seções
│   │   │   ├── HeroSection.tsx       # Hero com CTA
│   │   │   ├── HowItWorks.tsx        # Como funciona seção
│   │   │   ├── Plans.tsx             # Planos e pricing
│   │   │   ├── Footer.tsx            # Footer com links
│   │   │   ├── Navbar.tsx            # Navegação desktop
│   │   │   ├── BottomNavigation.tsx  # Navegação mobile
│   │   │   ├── Feed.tsx              # Feed de posts
│   │   │   ├── MyPurchases.tsx       # Histórico de compras
│   │   │   ├── CreatePost.tsx        # Form de criação de post
│   │   │   ├── OnboardingModal.tsx   # Modal de boas-vindas
│   │   │   └── FloatingActionButton.tsx
│   │   ├── assets/                   # Imagens e mídia
│   │   │   ├── hero/
│   │   │   └── logo/
│   │   ├── App.tsx                   # Router principal
│   │   ├── config.ts                 # Endereços dos contratos e ABIs
│   │   ├── web3.ts                   # Utilitários Web3
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/                        # Arquivos estáticos
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── contracts/                         # Smart Contracts
│   ├── GiroToken.sol                 # ERC-20 com claimOnboarding
│   ├── GiroMarketplace.sol           # Lógica de compra/venda
│   ├── hardhat.config.js
│   └── scripts/
│       ├── deploy.js
│       └── checkOnboardingStatus.js
│
├── supabase/                          # Schemas SQL (backup)
│   ├── schema.sql
│   └── functions/
│
├── artifacts/                         # Compiled contracts
├── deployments/                       # Deployment history
└── README.md
```

---

## 🚀 Quickstart

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- MetaMask extensão

### Instalação

**1. Clone o repositório:**
```bash
git clone https://github.com/davimqz/GIRO-SCROLL.git
cd GIRO-SCROLL
```

**2. Frontend setup:**
```bash
cd frontend
npm install
```

**3. Configure variáveis de ambiente (.env.local):**
```env
VITE_PINATA_API_KEY=7c40628e6041a24d8178
VITE_PINATA_SECRET_KEY=6e71d4352c67b294af8f1621aeb3f05eee8bf5e8331a1a55fd5b4e0abb31cb96
```

**4. Run desenvolvimento:**
```bash
npm run dev
```

Acesse: `http://localhost:5173`

**5. Build para produção:**
```bash
npm run build
npm run preview
```

---

## 🔗 Smart Contracts

### GiroToken.sol (ERC-20)
**Endereço Sepolia:** `0x23f1623554357651e3C5777f8D9ab868F2167108`

**Funções principais:**
- `claimOnboarding()` - Receba 50 GIRO tokens (uma única vez)
- `hasClaimedOnboarding(address user)` - Verifica se já reclamou
- `balanceOf(address owner)` - Saldo da wallet
- `approve(spender, amount)` - Aprovar gastos
- `transfer(to, amount)` - Transferir tokens

**Exemplo:**
```javascript
const contract = new Contract(giroTokenAddress, GIRO_TOKEN_ABI, signer);
const tx = await contract.claimOnboarding();
await tx.wait();
```

### GiroMarketplace.sol
**Endereço Sepolia:** `0xCEd6d78e729eda04F71e1e7614f2Bab2B797B2C2`

**Estrutura de Post:**
```solidity
struct Post {
  uint256 id;
  address creator;
  string title;
  string description;
  string category;
  string imageIpfs;      // Hash IPFS da imagem
  uint256 price;         // Em wei (GIRO tokens)
  uint256 createdAt;
  bool sold;             // Marca como vendido
}
```

**Funções principais:**
- `createPost(title, description, category, imageIpfs, price)` - Criar novo post
- `buyPost(postId)` - Comprar um item
- `getPost(postId)` - Ver detalhes
- `getUserPosts(user)` - Posts do usuário
- `getUserPurchases(user)` - Histórico de compras

**Exemplo:**
```javascript
const tx = await marketplace.createPost(
  "Notebook Samsung",
  "Notebook seminovo",
  "Eletrônicos",
  "QmHash...", // IPFS hash
  ethers.parseUnits("100", 18) // 100 GIRO tokens
);
```

---

## 🌐 Como Usar

### 1. **Conectar Carteira**
- Clique em "Conectar com MetaMask"
- Selecione sua conta
- Confirme na extensão MetaMask

### 2. **Reclamar Bônus Onboarding**
- Modal automático ao primeiro acesso
- Preencha nome e email
- Receba 50 GIRO tokens automaticamente

### 3. **Criar um Post**
- Clique no botão **+** flutuante
- Faça upload de foto (drag & drop)
- Preencha: título, descrição, categoria, preço
- Confirme a transação na MetaMask

### 4. **Comprar Items**
- Navegue pela Feed
- Clique em um item para ver detalhes
- Clique em "Comprar"
- Confirme a transação (20 GIRO = exemplo)

### 5. **Visualizar Compras**
- Abra "Minhas Compras"
- Veja histórico com imagens

---

## 📱 Responsividade

- **Desktop:** Layout com navbar horizontal, 3-coluna grid
- **Tablet:** Layout adaptado, menu simplificado
- **Mobile:** Bottom navigation, single-column, floating action button

---

## 🔐 Segurança

- **Variáveis de Ambiente**: Nunca comite .env.local
- **Smart Contract Audits**: Usar OpenZeppelin (auditado)
- **Rate Limiting**: Em desenvolvimento
- **CORS Configurado**: Apenas origens confiáveis
- **Soulbound Tokens**: Não transferíveis, vinculados à wallet

---

## 📊 Arquitetura

```
┌─────────────────────────────────────────┐
│         React SPA (Vite)                 │
│  - Landing Page                          │
│  - Feed                                  │
│  - Marketplace                           │
└────────────────┬────────────────────────┘
                 │
          ethers.js v6
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────┐      ┌──────▼────────┐
│   MetaMask   │      │  Sepolia RPC  │
│   Wallet     │      │  Testnet      │
└──────────────┘      └──────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
            ┌─────▼────┐        ┌──────▼─────┐
            │ GiroToken│        │ Marketplace│
            │  (ERC20) │        │   (Posts)  │
            └──────────┘        └────────────┘
                  │
            ┌─────▼────────────┐
            │  Pinata/IPFS     │
            │ (Image Storage)  │
            └──────────────────┘
```

---

## 💰 Tokenomics

- **Total Supply:** 1,000,000 GIRO
- **Decimals:** 18
- **Onboarding Bonus:** 50 GIRO (claimável uma vez)
- **Transaction Fee:** 0% (implementar depois)
- **Burn Rate:** 0% (implementar depois)

---

## 🐛 Troubleshooting

### Erro: "KEYS_MUST_BE_STRINGS"
**Problema:** Variáveis de ambiente não carregadas
**Solução:** Verifique se `.env.local` está configurado e redeploy

### Erro: "Already claimed onboarding bonus"
**Problema:** Wallet já reclamou
**Solução:** Use outra conta MetaMask

### Imagem não aparece no post
**Problema:** IPFS upload falhou
**Solução:** Verifique conexão e tamanho de arquivo (máx 5MB)

### MetaMask não conecta
**Problema:** Wrong network
**Solução:** Verifique se está em Sepolia Testnet

---

## 📈 Roadmap

- [ ] Sistema de pagamentos (Stripe)
- [ ] Dashboard de análytics
- [ ] Avaliações e reputação
- [ ] Sistema de chat
- [ ] Mobile app (React Native)
- [ ] Deploy em Mainnet
- [ ] DAO governance
- [ ] Staking de tokens

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT - veja [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/davimqz/GIRO-SCROLL/issues)
- **Discord:** [Em breve]
- **Email:** contato@giro.com

---

## 🙏 Agradecimentos

- OpenZeppelin - Smart contract standards
- Vercel - Hosting
- Pinata - IPFS gateway
- Ethereum Foundation - Blockchain infrastructure
- React community

---

**Desenvolvido com ❤️ para a economia circular**

Último update: Dezembro 15, 2025
