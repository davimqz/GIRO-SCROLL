import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, createWalletClient, custom, parseEther, http } from 'viem';
import { sepolia } from 'viem/chains';
import { supabase } from '../lib/supabase';
import { giroTokenABI } from '../contracts/giroToken';

const GIRO_TOKEN_ADDRESS = import.meta.env.VITE_GIRO_TOKEN_ADDRESS as `0x${string}`;

interface AchievementStatus {
  listingsCount: number;
  salesCount: number;
  purchasesCount: number;
  canClaimFirstListing: boolean;
  canClaimSecondSale: boolean;
  canClaimSecondPurchase: boolean;
  firstListingRewardClaimed: boolean;
  secondSaleRewardClaimed: boolean;
  secondPurchaseRewardClaimed: boolean;
}

export function useAchievements() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<AchievementStatus | null>(null);

  const walletAddress = wallets[0]?.address?.toLowerCase();

  /**
   * Busca status de achievements do usuário no Supabase
   */
  const fetchAchievements = useCallback(async () => {
    if (!authenticated || !walletAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase.rpc('get_user_achievements', {
        user_wallet: walletAddress,
      });

      // Se usuário não existe ainda no banco (erro P0001), isso é ok - apenas não mostra achievements
      if (supabaseError) {
        if (supabaseError.code === 'P0001') {
          console.warn('User not found in database yet - user likely still in onboarding');
          setAchievements(null);
          return;
        }
        throw supabaseError;
      }

      if (data && data.length > 0) {
        const achievement = data[0];
        setAchievements({
          listingsCount: achievement.listings_count,
          salesCount: achievement.sales_count,
          purchasesCount: achievement.purchases_count,
          canClaimFirstListing: achievement.can_claim_first_listing,
          canClaimSecondSale: achievement.can_claim_second_sale,
          canClaimSecondPurchase: achievement.can_claim_second_purchase,
          firstListingRewardClaimed: achievement.first_listing_reward_claimed,
          secondSaleRewardClaimed: achievement.second_sale_reward_claimed,
          secondPurchaseRewardClaimed: achievement.second_purchase_reward_claimed,
        });
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, walletAddress]);

  /**
   * Reclama recompensa de primeiro produto listado (10 GIRO)
   */
  const claimFirstListingReward = useCallback(async () => {
    if (!authenticated || !walletAddress || !wallets[0]) throw new Error('No wallet connected');

    try {
      setIsLoading(true);
      setError(null);

      const provider = await wallets[0].getEthereumProvider();
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(provider),
      });

      // Verificar rede
      const chainId = await walletClient.getChainId();
      if (chainId !== sepolia.id) {
        await walletClient.switchChain({ id: sepolia.id });
      }

      // Chamar contrato
      const hash = await walletClient.writeContract({
        address: GIRO_TOKEN_ADDRESS,
        abi: giroTokenABI,
        functionName: 'claimFirstListingReward',
        account: walletAddress as `0x${string}`,
        gas: 200000n,
      });

      // Aguardar confirmação
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Registrar no Supabase
      await supabase.from('reward_claims').insert({
        wallet_address: walletAddress,
        reward_type: 'first_listing',
        amount: parseEther('10').toString(),
        transaction_hash: hash,
        block_number: Number(receipt.blockNumber),
      });

      await fetchAchievements();
      return hash;
    } catch (err) {
      console.error('Error claiming first listing reward:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim reward');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, walletAddress, wallets, fetchAchievements]);

  /**
   * Reclama recompensa de segunda venda (20 GIRO)
   */
  const claimSecondSaleReward = useCallback(async () => {
    if (!authenticated || !walletAddress || !wallets[0]) throw new Error('No wallet connected');

    try {
      setIsLoading(true);
      setError(null);

      const provider = await wallets[0].getEthereumProvider();
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(provider),
      });

      const chainId = await walletClient.getChainId();
      if (chainId !== sepolia.id) {
        await walletClient.switchChain({ id: sepolia.id });
      }

      const hash = await walletClient.writeContract({
        address: GIRO_TOKEN_ADDRESS,
        abi: giroTokenABI,
        functionName: 'claimSecondSaleReward',
        account: walletAddress as `0x${string}`,
        gas: 200000n,
      });

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      await supabase.from('reward_claims').insert({
        wallet_address: walletAddress,
        reward_type: 'second_sale',
        amount: parseEther('20').toString(),
        transaction_hash: hash,
        block_number: Number(receipt.blockNumber),
      });

      await fetchAchievements();
      return hash;
    } catch (err) {
      console.error('Error claiming second sale reward:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim reward');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, walletAddress, wallets, fetchAchievements]);

  /**
   * Reclama recompensa de segunda compra (20 GIRO)
   */
  const claimSecondPurchaseReward = useCallback(async () => {
    if (!authenticated || !walletAddress || !wallets[0]) throw new Error('No wallet connected');

    try {
      setIsLoading(true);
      setError(null);

      const provider = await wallets[0].getEthereumProvider();
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(provider),
      });

      const chainId = await walletClient.getChainId();
      if (chainId !== sepolia.id) {
        await walletClient.switchChain({ id: sepolia.id });
      }

      const hash = await walletClient.writeContract({
        address: GIRO_TOKEN_ADDRESS,
        abi: giroTokenABI,
        functionName: 'claimSecondPurchaseReward',
        account: walletAddress as `0x${string}`,
        gas: 200000n,
      });

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      await supabase.from('reward_claims').insert({
        wallet_address: walletAddress,
        reward_type: 'second_purchase',
        amount: parseEther('20').toString(),
        transaction_hash: hash,
        block_number: Number(receipt.blockNumber),
      });

      await fetchAchievements();
      return hash;
    } catch (err) {
      console.error('Error claiming second purchase reward:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim reward');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, walletAddress, wallets, fetchAchievements]);

  return {
    achievements,
    isLoading,
    error,
    fetchAchievements,
    claimFirstListingReward,
    claimSecondSaleReward,
    claimSecondPurchaseReward,
  };
}
