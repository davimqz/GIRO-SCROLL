# CONTRATOS GIRO

## Setup

```bash
npm install
cp .env.example .env
# Editar .env com suas chaves
```

## Compile

```bash
npm run compile
```

## Deploy em Sepolia

```bash
npm run deploy:sepolia
```

## Enderços

Os endereços são salvos em `deployments/sepolia-addresses.json` após o deploy.

## Contratos

- **GiroToken.sol**: Token ERC-20 (GIRO)
- **GiroMarketplace.sol**: Marketplace para criar e comprar posts
