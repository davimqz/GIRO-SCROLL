# 🎨 Como Adicionar Logo do Token GIRO na MetaMask

## Opção 1: Logo Local (Desenvolvimento)
O logo foi criado em `frontend/public/logo/giro-token.svg`

Para usar localmente durante desenvolvimento:
1. Execute o frontend: `npm run dev`
2. O logo estará disponível em: `http://localhost:5173/logo/giro-token.svg`
3. Use este URL ao adicionar o token

## Opção 2: Hospedar na Web (Produção)

### GitHub:
1. Faça commit do logo
2. Acesse: `https://raw.githubusercontent.com/seu-usuario/GIRO-SCROLL/main/frontend/public/logo/giro-token.svg`
3. Use este URL

### IPFS (Recomendado para Web3):
1. Faça upload do logo no Pinata: https://pinata.cloud
2. Use o link IPFS gerado
3. Exemplo: `ipfs://QmXxxx.../giro-token.svg`

### Imgur/CDN:
1. Faça upload em https://imgur.com
2. Use o link direto da imagem

## Opção 3: Adicionar Manualmente na MetaMask

Infelizmente, a MetaMask **não permite** adicionar logos customizados para tokens na Sepolia testnet através da interface.

O logo só aparece automaticamente para tokens que:
- Estão na mainnet
- Foram registrados no MetaMask token registry
- Fazem parte de listas de tokens conhecidas (como CoinGecko, Uniswap)

## Solução Temporária

Para testnet, é normal tokens não terem logo. Mas você pode:

1. **Verificar o balance correto:**
   - Você tem 100,000 GIRO (supply inicial como owner)
   - Cada claim desconta 50 GIRO desse total

2. **Adicionar logo no frontend:**
   - Usar o logo SVG nos componentes React
   - Mostrar balance formatado com o logo

## Logo no Frontend

Vou criar um componente para exibir o balance com logo!
