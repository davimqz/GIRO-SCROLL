import { useState, useEffect, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { supabase, type User } from '../lib/supabase';

export function useUser() {
  const { wallets } = useWallets();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = wallets[0]?.address?.toLowerCase();

  /**
   * Busca dados do usuário no Supabase pelo endereço da wallet
   */
  const fetchUser = useCallback(async () => {
    if (!walletAddress) {
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (supabaseError) {
        if (supabaseError.code === 'PGRST116') {
          // Usuário não encontrado
          setUser(null);
          return;
        }
        throw supabaseError;
      }

      setUser(data);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Busca o usuário quando a wallet muda
  useEffect(() => {
    if (walletAddress) {
      fetchUser();
    }
  }, [walletAddress, fetchUser]);

  return {
    user,
    isLoading,
    error,
    fetchUser,
    walletAddress,
  };
}
