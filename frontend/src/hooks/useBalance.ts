import { useState, useEffect, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { giroTokenABI } from '../contracts/giroToken';

const GIRO_TOKEN_ADDRESS = import.meta.env.VITE_GIRO_TOKEN_ADDRESS as `0x${string}`;

export function useBalance() {
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = wallets[0]?.address as `0x${string}` | undefined;

  /**
   * Busca o balance de GIRO do usuário no blockchain
   */
  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setBalance(0n);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      const balanceData = await publicClient.readContract({
        address: GIRO_TOKEN_ADDRESS,
        abi: giroTokenABI,
        functionName: 'balanceOf',
        args: [walletAddress],
      });

      setBalance(balanceData as bigint);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      setBalance(0n);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Busca o balance quando a wallet muda
  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
      // Atualiza a cada 10 segundos
      const interval = setInterval(() => {
        fetchBalance();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [walletAddress, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
    walletAddress,
  };
}
