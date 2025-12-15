# 🔧 Correções Implementadas - GiroToken + GiroMarketplace

## Problema Identificado
O `executePurchase()` tinha uma verificação de autorização incorreta:
```solidity
❌ ERRADO:
require(msg.sender == buyer || msg.sender == address(this), "Unauthorized");
```

O `msg.sender` seria o Marketplace contract, não o buyer, então a verificação não funcionava corretamente.

## Solução Implementada

### 1. **GiroToken.sol** - Mudanças:

#### a) Adicionado `marketplaceAddress` e modifier:
```solidity
/// @notice Endereço do contrato Marketplace autorizado
address public marketplaceAddress;

/// @notice Modifier para autorizar apenas o Marketplace
modifier onlyMarketplace() {
    require(msg.sender == marketplaceAddress, "Only marketplace can call this");
    _;
}
```

#### b) Atualizado constructor:
```solidity
// ANTES:
constructor(uint256 initialSupply)

// DEPOIS:
constructor(uint256 initialSupply, address _marketplaceAddress)
```

#### c) Adicionada função para atualizar marketplace:
```solidity
function setMarketplaceAddress(address _marketplaceAddress) external onlyOwner {
    require(_marketplaceAddress != address(0), "Invalid marketplace address");
    marketplaceAddress = _marketplaceAddress;
}
```

#### d) Corrigido `executePurchase()`:
```solidity
// ANTES:
require(msg.sender == buyer || msg.sender == address(this), "Unauthorized");

// DEPOIS:
modifier onlyMarketplace - garante que apenas Marketplace pode chamar
```

## Como Aplicar as Mudanças

### Opção 1: Usar o novo deployment script (RECOMENDADO)
```bash
npx hardhat run scripts/deployNew.js --network scrollSepolia
```

Isso vai:
1. Fazer deploy do GiroToken
2. Fazer deploy do GiroMarketplace
3. Configurar automaticamente o marketplace address no token
4. Exibir os endereços para você copiar no .env

### Opção 2: Configurar contratos existentes
Se você quer manter os contratos já deployed, rode:
```bash
npx hardhat run scripts/setupContracts.js --network scrollSepolia
```

Isso vai apenas chamar `setMarketplaceAddress()` nos contratos existentes.

## Resultado Esperado

Agora quando você COMPRA um produto:
1. ✅ Frontend chama `buyProduct()` no Marketplace
2. ✅ Marketplace chama `executePurchase()` no GiroToken
3. ✅ GiroToken valida que o caller é o Marketplace (onlyMarketplace modifier)
4. ✅ GiroToken queima os tokens do comprador corretamente
5. ✅ Contadores de vendas/compras são incrementados

## Fluxo Completo da Compra Agora

```
Usuário A (Comprador) → Browser
                     ↓
                 Clica "Comprar"
                     ↓
            Frontend chama approve() no GiroToken
            (autoriza Marketplace a gastar tokens)
                     ↓
            Marketplace.buyProduct(productId)
                     ↓
            GiroToken.executePurchase(buyer, seller, amount)
                     ↓
            ✅ Tokens queimados: Usuário A -= amount
            ✅ Contadores atualizados
            ✅ Evento ProductPurchased emitido
```

## Próximos Passos

1. Se você fez novo deploy, atualize o `.env` com os novos endereços
2. Se usou o setup script, apenas confirme que `setMarketplaceAddress()` funcionou
3. Teste a compra novamente - agora os tokens devem ser queimados corretamente!
