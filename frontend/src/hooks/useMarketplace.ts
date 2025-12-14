import { useState, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, createWalletClient, custom, http, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { GIRO_MARKETPLACE_ABI, CONTRACTS } from '../contracts';
import { giroTokenABI } from '../contracts/giroToken';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export interface MarketplaceProduct {
  id: bigint;
  seller: `0x${string}`;
  title: string;
  description: string;
  priceInGiro: bigint;
  sold: boolean;
  createdAt: bigint;
  soldAt: bigint;
  buyer: `0x${string}`;
}

export function useMarketplace() {
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = (wallets[0]?.address as `0x${string}`) || undefined;

  /**
   * Lista todos os produtos ativos no marketplace
   */
  const getActiveProducts = useCallback(async (): Promise<MarketplaceProduct[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const productIds = (await publicClient.readContract({
        address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
        abi: GIRO_MARKETPLACE_ABI,
        functionName: 'getActiveProducts',
      })) as bigint[];

      console.log('🔍 Active product IDs:', productIds);

      const products: MarketplaceProduct[] = [];

      for (const productId of productIds) {
        try {
          const productData = (await publicClient.readContract({
            address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
            abi: GIRO_MARKETPLACE_ABI,
            functionName: 'getProduct',
            args: [productId],
          })) as any;

          console.log(`📦 Product ${productId.toString()} data:`, productData);

          // Certifica que os dados estão corretos
          const product: MarketplaceProduct = {
            id: BigInt(productData.id || productId),
            seller: productData.seller as `0x${string}`,
            title: String(productData.title || ''),
            description: String(productData.description || ''),
            priceInGiro: BigInt(productData.priceInGiro || 0),
            sold: Boolean(productData.sold || false),
            createdAt: BigInt(productData.createdAt || 0),
            soldAt: BigInt(productData.soldAt || 0),
            buyer: productData.buyer as `0x${string}`,
          };

          products.push(product);
          
          // Pequeno delay para evitar throttling do RPC
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Error fetching product ${productId.toString()}:`, err);
          // Continua para o próximo produto em caso de erro
        }
      }

      console.log('✅ Formatted products:', products);
      return products;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMsg);
      console.error('Error fetching products:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Retorna TODOS os produtos (vendidos e não-vendidos)
   * Útil para buscar compras e histórico
   */
  const getAllProducts = useCallback(async (): Promise<MarketplaceProduct[]> => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar o contador de produtos
      const productCount = (await publicClient.readContract({
        address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
        abi: GIRO_MARKETPLACE_ABI,
        functionName: 'productCounter',
      })) as bigint;

      console.log('📦 Total products count:', productCount.toString());

      const products: MarketplaceProduct[] = [];

      // Iterar até o contador real
      for (let i = 0; i < Number(productCount); i++) {
        try {
          const productData = (await publicClient.readContract({
            address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
            abi: GIRO_MARKETPLACE_ABI,
            functionName: 'getProduct',
            args: [BigInt(i)],
          })) as any;

          if (productData) {
            const product: MarketplaceProduct = {
              id: BigInt(productData.id || i),
              seller: productData.seller as `0x${string}`,
              title: String(productData.title || ''),
              description: String(productData.description || ''),
              priceInGiro: BigInt(productData.priceInGiro || 0),
              sold: Boolean(productData.sold || false),
              createdAt: BigInt(productData.createdAt || 0),
              soldAt: BigInt(productData.soldAt || 0),
              buyer: productData.buyer as `0x${string}`,
            };

            products.push(product);
          }

          // Delay para evitar RPC throttling
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.debug(`Could not fetch product ${i}`);
        }
      }

      console.log('✅ All products fetched:', products.length);
      return products;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch all products';
      setError(errorMsg);
      console.error('Error fetching all products:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Retorna produtos de um vendedor específico
   */
  const getSellerProducts = useCallback(
    async (sellerAddress: `0x${string}`): Promise<bigint[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const productIds = (await publicClient.readContract({
          address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
          abi: GIRO_MARKETPLACE_ABI,
          functionName: 'getSellerProducts',
          args: [sellerAddress],
        })) as bigint[];

        return productIds;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch seller products';
        setError(errorMsg);
        console.error('Error fetching seller products:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Retorna detalhes de um produto específico
   */
  const getProduct = useCallback(
    async (productId: bigint): Promise<MarketplaceProduct | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const product = (await publicClient.readContract({
          address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
          abi: GIRO_MARKETPLACE_ABI,
          functionName: 'getProduct',
          args: [productId],
        })) as MarketplaceProduct;

        return product;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch product';
        setError(errorMsg);
        console.error('Error fetching product:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Cria um novo produto no marketplace
   * Retorna o blockchain_product_id do produto criado
   */
  const listProduct = useCallback(
    async (title: string, description: string, priceInGiro: number): Promise<bigint | null> => {
      if (!walletAddress) {
        setError('Wallet not connected');
        return null;
      }

      if (!wallets[0]) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const provider = await wallets[0].getEthereumProvider();
        if (!provider) {
          throw new Error('Failed to get Ethereum provider');
        }

        const walletClient = createWalletClient({
          chain: sepolia,
          transport: custom(provider),
        });

        const priceInWei = parseEther(priceInGiro.toString());

        console.log('📝 Creating contract write call...');
        const hash = await walletClient.writeContract({
          account: walletAddress,
          address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
          abi: GIRO_MARKETPLACE_ABI,
          functionName: 'listProduct',
          args: [title, description, priceInWei],
          gas: 300000n,
        });

        console.log('⏳ Waiting for transaction receipt...', hash);
        
        // Aguarda confirmação
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        
        console.log('✅ Transaction confirmed:', receipt.transactionHash);
        console.log('📊 Receipt:', receipt);
        
        // Tenta extrair o product ID do evento
        if (receipt.logs && receipt.logs.length > 0) {
          console.log(`🔍 Found ${receipt.logs.length} logs`);
          
          // Procura pelo último log que é provavelmente o ProductListed
          for (let i = receipt.logs.length - 1; i >= 0; i--) {
            const log = receipt.logs[i];
            console.log(`Log ${i}:`, log);
            
            // Extrai o ID do segundo tópico (índice 1 é productId)
            if (log.topics && log.topics.length > 1 && log.topics[1]) {
              try {
                const productId = BigInt(log.topics[1] as string);
                console.log('✅ Product ID from event:', productId.toString());
                return productId;
              } catch (e) {
                console.log('⚠️ Failed to extract from this log');
              }
            }
          }
        }

        // Se não conseguir extrair do evento, buscar o productCounter
        console.log('📊 Fetching productCounter as fallback...');
        const productCounter = (await publicClient.readContract({
          address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
          abi: GIRO_MARKETPLACE_ABI,
          functionName: 'productCounter',
        })) as bigint;
        
        console.log('📦 Current productCounter:', productCounter.toString());
        
        // O último produto criado tem ID = productCounter - 1
        const lastProductId = productCounter - 1n;
        console.log('✅ Product ID from counter (fallback):', lastProductId.toString());
        
        return lastProductId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to list product';
        setError(errorMsg);
        console.error('❌ Error listing product:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, wallets]
  );

  /**
   * Compra um produto do marketplace
   * 1. Aprova tokens para o Marketplace gastar
   * 2. Executa a compra (tokens são queimados)
   */
  const buyProduct = useCallback(
    async (productId: bigint, priceInGiro: bigint): Promise<boolean> => {
      if (!walletAddress) {
        setError('Wallet not connected');
        return false;
      }

      if (!wallets[0]) {
        setError('Wallet not connected');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const provider = await wallets[0].getEthereumProvider();
        if (!provider) {
          throw new Error('Failed to get Ethereum provider');
        }

        const walletClient = createWalletClient({
          chain: sepolia,
          transport: custom(provider),
        });

        // Step 1: Aprovar tokens
        console.log('Approving tokens...');
        const approveHash = await walletClient.writeContract({
          account: walletAddress,
          address: CONTRACTS.GIRO_TOKEN.address as `0x${string}`,
          abi: giroTokenABI,
          functionName: 'approve',
          args: [CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`, priceInGiro],
          gas: 100000n,
        });

        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log('Tokens approved');

        // Step 2: Executar compra
        console.log('Buying product...');
        const buyHash = await walletClient.writeContract({
          account: walletAddress,
          address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
          abi: GIRO_MARKETPLACE_ABI,
          functionName: 'buyProduct',
          args: [productId],
          gas: 200000n,
        });

        await publicClient.waitForTransactionReceipt({ hash: buyHash });
        console.log('Product purchased successfully');

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to buy product';
        setError(errorMsg);
        console.error('Error buying product:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, wallets]
  );

  /**
   * Cancela a listagem de um produto
   */
  const cancelProduct = useCallback(
    async (productId: bigint): Promise<boolean> => {
      if (!walletAddress) {
        setError('Wallet not connected');
        return false;
      }

      if (!wallets[0]) {
        setError('Wallet not connected');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const provider = await wallets[0].getEthereumProvider();
        if (!provider) {
          throw new Error('Failed to get Ethereum provider');
        }

        const walletClient = createWalletClient({
          chain: sepolia,
          transport: custom(provider),
        });

        const hash = await walletClient.writeContract({
          account: walletAddress,
          address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
          abi: GIRO_MARKETPLACE_ABI,
          functionName: 'cancelProduct',
          args: [productId],
          gas: 150000n,
        });

        await publicClient.waitForTransactionReceipt({ hash });

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to cancel product';
        setError(errorMsg);
        console.error('Error canceling product:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, wallets]
  );

  /**
   * Retorna total de produtos
   */
  const getTotalProducts = useCallback(async (): Promise<bigint> => {
    try {
      setIsLoading(true);
      setError(null);

      const total = (await publicClient.readContract({
        address: CONTRACTS.GIRO_MARKETPLACE.address as `0x${string}`,
        abi: GIRO_MARKETPLACE_ABI,
        functionName: 'getTotalProducts',
      })) as bigint;

      return total;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch total products';
      setError(errorMsg);
      console.error('Error fetching total products:', err);
      return 0n;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getActiveProducts,
    getAllProducts,
    getSellerProducts,
    getProduct,
    listProduct,
    buyProduct,
    cancelProduct,
    getTotalProducts,
  };
}
