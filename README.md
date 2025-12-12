# 🌀 Giro - Marketplace de Economia Circular

Marketplace Web3 na Scroll Network com token GIRO (ERC-20) para recompensar economia circular.

## 📋 Estrutura do Projeto

```
giro-scroll/
├── contracts/          # Smart contracts Solidity
│   └── GiroToken.sol  # Token ERC-20 com onboarding rewards
├── scripts/           # Scripts de deploy
│   └── deploy.js      # Deploy do GiroToken
├── test/              # Testes com Hardhat
│   └── GiroToken.test.js
├── frontend/          # Frontend React + Vite + Privy
├── deployments/       # JSONs com endereços dos contratos deployados
└── hardhat.config.js  # Configuração Hardhat
```

## 🚀 Setup Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
copy .env.example .env
```

Edite `.env` e adicione:
- `PRIVATE_KEY`: Private key da sua wallet (sem 0x)
- `SCROLLSCAN_API_KEY`: API key do Scrollscan (opcional, para verificação)

⚠️ **IMPORTANTE:** Use uma wallet de teste! Nunca coloque a private key da sua wallet principal.

### 3. Pegar ETH de Testnet

Para fazer deploy na Scroll Sepolia, você precisa de ETH de testnet:

1. Vá em: https://sepolia.scroll.io/faucet
2. Ou pegue Sepolia ETH em: https://sepoliafaucet.com
3. Faça bridge para Scroll Sepolia: https://sepolia.scroll.io/bridge

## 🧪 Testes

### Rodar todos os testes

```bash
npm test
```

### Testes com relatório de gas

```bash
npm run test:gas
```

### Coverage

```bash
npm run coverage
```

## 📦 Deploy

### Deploy na Scroll Sepolia (Testnet)

```bash
npm run deploy:sepolia
```

Após o deploy, você verá:
- ✅ Endereço do contrato
- 🔗 Link do Scrollscan
- 📊 Informações do token
- 💾 Arquivo JSON salvo em `deployments/`

### Deploy na Scroll Mainnet (Produção)

```bash
npm run deploy:mainnet
```

⚠️ **Atenção:** Mainnet usa ETH real! Certifique-se de ter ETH suficiente na Scroll Network.

## 🔧 Verificar Contrato no Scrollscan

Após o deploy, o script tenta verificar automaticamente. Se falhar, verifique manualmente:

```bash
npx hardhat verify --network scrollSepolia <CONTRACT_ADDRESS> <INITIAL_SUPPLY>
```

Exemplo:
```bash
npx hardhat verify --network scrollSepolia 0x1234...5678 100000
```

## 📝 GiroToken - Detalhes do Contrato

### Informações Básicas

- **Nome:** Giro Token
- **Símbolo:** GIRO
- **Decimals:** 18
- **Max Supply:** 10,000,000 GIRO
- **Onboarding Reward:** 50 GIRO por usuário

### Principais Funções

#### `claimOnboardingReward()`
Permite usuário reivindicar 50 GIRO após completar onboarding. Só pode ser chamado uma vez por wallet.

```solidity
function claimOnboardingReward() external
```

#### `canClaimReward(address wallet)`
Verifica se uma wallet pode reivindicar reward.

```solidity
function canClaimReward(address wallet) external view returns (bool)
```

#### `mintRewardPool(uint256 amount)`
(Owner only) Minta tokens adicionais para o pool de rewards.

```solidity
function mintRewardPool(uint256 amount) external onlyOwner
```

#### `pause()` / `unpause()`
(Owner only) Pausa/despausa todas as transferências em caso de emergência.

```solidity
function pause() external onlyOwner
function unpause() external onlyOwner
```

### Events

```solidity
event OnboardingRewardClaimed(address indexed user, uint256 amount);
event RewardPoolMinted(address indexed to, uint256 amount);
```

## 🔗 Integração com Frontend

### 1. Adicionar endereço do contrato no `.env` do frontend

```bash
# frontend/.env
VITE_GIRO_TOKEN_ADDRESS=0x1234...5678
```

### 2. Exemplo de integração com Viem

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { scrollSepolia } from 'viem/chains';
import { usePrivy } from '@privy-io/react-auth';

const giroTokenABI = [
  {
    name: 'claimOnboardingReward',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'canClaimReward',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

// Verificar se pode reivindicar
const publicClient = createPublicClient({
  chain: scrollSepolia,
  transport: http(),
});

const canClaim = await publicClient.readContract({
  address: import.meta.env.VITE_GIRO_TOKEN_ADDRESS,
  abi: giroTokenABI,
  functionName: 'canClaimReward',
  args: [userWalletAddress],
});

// Reivindicar reward
const { wallet } = usePrivy();
const walletClient = createWalletClient({
  chain: scrollSepolia,
  transport: custom(wallet.provider),
});

const hash = await walletClient.writeContract({
  address: import.meta.env.VITE_GIRO_TOKEN_ADDRESS,
  abi: giroTokenABI,
  functionName: 'claimOnboardingReward',
});

await publicClient.waitForTransactionReceipt({ hash });
```

## 🧩 Arquitetura do Sistema

```
┌─────────────────┐
│   Frontend      │ (React + Privy Auth)
│   (Vercel)      │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌────────────────┐
│   Supabase      │  │  Scroll Sepolia│
│   (PostgreSQL)  │  │   (Blockchain) │
│                 │  │                │
│  - users        │  │  - GiroToken   │
│  - posts        │  │    (ERC-20)    │
│  - messages     │  │                │
└─────────────────┘  └────────────────┘
```

**O que vai on-chain:**
- Token GIRO (balance, transfers)
- Tracking de onboarding rewards

**O que vai off-chain (Supabase):**
- Perfis de usuário
- Posts/produtos
- Mensagens privadas
- Curtidas e comentários

## 📊 Custos Estimados

### Gas Costs (Scroll Sepolia Testnet)

- **Deploy:** ~0.0015 ETH
- **claimOnboardingReward:** ~0.0001 ETH (~50-70k gas)
- **transfer:** ~0.00003 ETH (~21k gas)

### Produção (Scroll Mainnet)

Com gas price de 0.5 gwei (típico na Scroll):
- Deploy: ~$0.50 USD
- Claim reward: ~$0.02 USD
- Transfer: ~$0.005 USD

## 🛠️ Comandos Úteis

```bash
# Compilar contratos
npm run compile

# Limpar artifacts
npm run clean

# Rodar node local
npm run node

# Coverage de testes
npm run coverage
```

## 🔐 Segurança

- ✅ Usa OpenZeppelin (padrão da indústria)
- ✅ Pausable (em caso de emergência)
- ✅ Ownable (acesso controlado)
- ✅ Limits de supply (não pode mintar infinito)
- ✅ Testes unitários completos

## 📚 Recursos

- [Scroll Docs](https://docs.scroll.io/)
- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Scrollscan Explorer](https://sepolia.scrollscan.com/)

## 🤝 Contribuindo

1. Fork o repo
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**Feito com ❤️ para economia circular na Scroll Network 🌀**
