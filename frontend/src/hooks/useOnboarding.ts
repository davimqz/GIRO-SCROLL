import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase, type User, type OnboardingStatus } from '../lib/supabase';
import { GIRO_TOKEN_ABI, GIRO_TOKEN_ADDRESS } from '../contracts/giroToken';
import { createPublicClient, createWalletClient, custom, http, parseEther } from 'viem';
import { sepolia } from 'viem/chains';

export interface OnboardingData {
  name: string;
  email: string;
  phone?: string;
}

export function useOnboarding() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  const walletAddress = wallets[0]?.address?.toLowerCase();

  // Carrega status do onboarding ao conectar wallet
  useEffect(() => {
    if (authenticated && walletAddress) {
      loadOnboardingStatus();
    }
  }, [authenticated, walletAddress]);

  const loadOnboardingStatus = async () => {
    if (!walletAddress) return;

    try {
      // Busca usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      setUserProfile(userData);

      // Se usuário existe, busca status de onboarding
      if (userData) {
        const { data: statusData, error: statusError } = await supabase
          .from('onboarding_status')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (statusError && statusError.code !== 'PGRST116') {
          throw statusError;
        }

        setOnboardingStatus(statusData);

        // Determina o step atual baseado no progresso
        if (statusData) {
          if (statusData.step_reward_claimed) {
            setCurrentStep(4); // Completo
          } else if (statusData.step_phone_verified) {
            setCurrentStep(3); // Claim reward
          } else if (statusData.step_profile_completed) {
            setCurrentStep(3); // Phone verification (vamos simplificar)
          } else if (statusData.step_wallet_connected) {
            setCurrentStep(2); // Profile
          } else {
            setCurrentStep(1); // Wallet
          }
        }
      }
    } catch (err) {
      console.error('Error loading onboarding status:', err);
      setError('Failed to load onboarding status');
    }
  };

  // Step 1: Conectar wallet (já feito pelo Privy)
  const connectWallet = useCallback(async () => {
    if (!walletAddress) {
      setError('No wallet connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Cria ou atualiza usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert(
          {
            wallet_address: walletAddress,
          },
          {
            onConflict: 'wallet_address',
          }
        )
        .select()
        .single();

      if (userError) throw userError;

      setUserProfile(userData);

      // Cria ou atualiza status de onboarding
      const { data: statusData, error: statusError } = await supabase
        .from('onboarding_status')
        .upsert(
          {
            user_id: userData.id,
            wallet_address: walletAddress,
            step_wallet_connected: true,
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (statusError) throw statusError;

      setOnboardingStatus(statusData);
      setCurrentStep(2);
      return true;
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Step 2: Completar perfil
  const completeProfile = useCallback(
    async (data: OnboardingData) => {
      if (!userProfile || !onboardingStatus) {
        setError('User not found');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Atualiza perfil do usuário
        const { error: userError } = await supabase
          .from('users')
          .update({
            name: data.name,
            email: data.email,
          })
          .eq('id', userProfile.id);

        if (userError) throw userError;

        // Atualiza status de onboarding
        const { data: statusData, error: statusError } = await supabase
          .from('onboarding_status')
          .update({
            step_profile_completed: true,
            step_phone_verified: true, // Simplificando: marcando como verificado
          })
          .eq('id', onboardingStatus.id)
          .select()
          .single();

        if (statusError) throw statusError;

        setOnboardingStatus(statusData);
        setCurrentStep(3);
        return true;
      } catch (err: any) {
        console.error('Error completing profile:', err);
        setError(err.message || 'Failed to complete profile');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userProfile, onboardingStatus]
  );

  // Step 3: Claim reward
  const claimReward = useCallback(async () => {
    if (!userProfile || !onboardingStatus || !walletAddress || !wallets[0]) {
      setError('Missing required data');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verifica se já claimou
      if (onboardingStatus.step_reward_claimed) {
        setError('Reward already claimed');
        return false;
      }

      // Pega o provider da wallet
      const ethereumProvider = await wallets[0].getEthereumProvider();

      // Verifica a rede atual
      const chainIdHex = await ethereumProvider.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainIdHex as string, 16);
      const targetChainId = sepolia.id; // 11155111

      // Se não estiver na Sepolia, solicita troca de rede
      if (currentChainId !== targetChainId) {
        try {
          await ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // Se a rede não existe na wallet, adiciona
          if (switchError.code === 4902) {
            await ethereumProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: 'Sepolia Testnet',
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Cria wallet client
      const walletClient = createWalletClient({
        account: walletAddress as `0x${string}`,
        chain: sepolia,
        transport: custom(ethereumProvider),
      });

      // Chama o contrato para claim reward
      const hash = await walletClient.writeContract({
        address: GIRO_TOKEN_ADDRESS as `0x${string}`,
        abi: GIRO_TOKEN_ABI,
        functionName: 'claimOnboardingReward',
      });

      // Aguarda confirmação da transação
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Salva o claim no banco
      const { error: claimError } = await supabase.from('reward_claims').insert({
        user_id: userProfile.id,
        wallet_address: walletAddress,
        reward_type: 'onboarding',
        amount: parseEther('50').toString(),
        transaction_hash: hash,
        block_number: Number(receipt.blockNumber),
      });

      if (claimError) throw claimError;

      // Atualiza status de onboarding
      const { data: statusData, error: statusError } = await supabase
        .from('onboarding_status')
        .update({
          step_reward_claimed: true,
          reward_transaction_hash: hash,
          reward_claimed_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .eq('id', onboardingStatus.id)
        .select()
        .single();

      if (statusError) throw statusError;

      setOnboardingStatus(statusData);
      setCurrentStep(4);
      return true;
    } catch (err: any) {
      console.error('Error claiming reward:', err);
      setError(err.message || 'Failed to claim reward');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, onboardingStatus, walletAddress, wallets]);

  return {
    // Estado
    currentStep,
    isLoading,
    error,
    onboardingStatus,
    userProfile,
    authenticated,
    walletAddress,

    // Ações
    connectWallet,
    completeProfile,
    claimReward,
    setCurrentStep,
    setError,
  };
}
