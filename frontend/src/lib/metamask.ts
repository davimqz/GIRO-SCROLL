// MetaMask utilities for wallet connection and interaction

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletInfo {
  address: string;
  chainId: number;
}

export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for ethereum provider
  if (typeof window.ethereum !== 'undefined') {
    console.log('window.ethereum detected:', window.ethereum.isMetaMask ? 'MetaMask' : 'Other provider');
    return true;
  }
  
  console.warn('window.ethereum is undefined');
  return false;
}

// Wait for MetaMask to be injected into the page (up to 5 seconds)
export async function waitForMetaMask(maxAttempts = 50): Promise<boolean> {
  console.log('Waiting for MetaMask to be injected...');
  for (let i = 0; i < maxAttempts; i++) {
    if (typeof window.ethereum !== 'undefined') {
      console.log('✓ MetaMask detected after', i * 100, 'ms');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.error('✗ MetaMask not detected after', maxAttempts * 100, 'ms');
  console.log('Current window.ethereum:', window.ethereum);
  console.log('All window keys with "ethereum":', Object.keys(window).filter(k => k.toLowerCase().includes('ethereum')));
  return false;
}

export async function connectWallet(): Promise<WalletInfo | null> {
  try {
    // Wait for MetaMask to be injected
    const metamaskReady = await waitForMetaMask();
    if (!metamaskReady) {
      const error = new Error('MetaMask is not installed. Please install MetaMask extension from https://metamask.io');
      console.error('MetaMask Detection Error:', error);
      throw error;
    }

    // Additional check to ensure ethereum object is ready
    if (!window.ethereum.isMetaMask) {
      console.warn('ethereum object detected but may not be MetaMask');
    }

    console.log('Attempting to connect to MetaMask...');

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Get current chain ID
    const chainIdHex = await window.ethereum.request({
      method: 'eth_chainId',
    }) as string;

    const chainId = parseInt(chainIdHex, 16);

    // Check if on Sepolia testnet (chainId: 11155111)
    const SEPOLIA_CHAIN_ID = 11155111;
    if (chainId !== SEPOLIA_CHAIN_ID) {
      // Try to switch to Sepolia
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + SEPOLIA_CHAIN_ID.toString(16) }],
        });
      } catch (switchError: any) {
        // If chain doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x' + SEPOLIA_CHAIN_ID.toString(16),
                chainName: 'Sepolia',
                rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        }
      }
    }

    return {
      address: accounts[0]!.toLowerCase(),
      chainId: SEPOLIA_CHAIN_ID,
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    console.log('Attempting to disconnect wallet...');
    // MetaMask doesn't have a native disconnect method, but we can:
    // 1. Clear the user's cached account permissions (if available)
    // 2. The app will handle clearing local state via the callback
    
    // Try to request permissions to disconnect (some wallets support this)
    if (window.ethereum?.request) {
      try {
        // This will clear permissions for the current site on some wallets
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [
            {
              eth_accounts: {},
            },
          ],
        });
      } catch (err: any) {
        // Permission change might fail - that's okay, the app state will be cleared
        console.log('Note: wallet_requestPermissions not available or user denied');
      }
    }
    
    console.log('✓ Wallet disconnection handled - app state will be cleared');
  } catch (error) {
    console.error('Error during disconnect:', error);
    throw error;
  }
}

export async function getConnectedWallet(): Promise<WalletInfo | null> {
  try {
    if (!isMetaMaskInstalled()) {
      return null;
    }

    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    }) as string[];

    if (accounts.length === 0) {
      return null;
    }

    const chainIdHex = await window.ethereum.request({
      method: 'eth_chainId',
    }) as string;

    const chainId = parseInt(chainIdHex, 16);

    return {
      address: accounts[0]!.toLowerCase(),
      chainId,
    };
  } catch (error) {
    console.error('Failed to get connected wallet:', error);
    return null;
  }
}

export function setupWalletListener(callback: (accounts: string[]) => void): () => void {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  window.ethereum.on('accountsChanged', callback);

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', callback);
    }
  };
}
