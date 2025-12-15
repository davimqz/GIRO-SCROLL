import { BrowserProvider } from 'ethers';

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask não instalada');
  }

  try {
    // Usar wallet_requestPermissions para sempre mostrar o seletor de contas
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    });

    // Agora pegar as contas
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts'
    }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error('Nenhuma conta selecionada');
    }
    
    const provider = new BrowserProvider(window.ethereum);
    
    // Check network
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      throw new Error('Por favor, mude para Sepolia testnet');
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Conexão cancelada pelo usuário');
    }
    throw error;
  }
}

export function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask não instalada');
  return new BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}

export function setupAccountListener(callback: (accounts: string[]) => void) {
  if (!window.ethereum) return () => {};
  
  window.ethereum.on('accountsChanged', callback);
  return () => window.ethereum.removeListener('accountsChanged', callback);
}
