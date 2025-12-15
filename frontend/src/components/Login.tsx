import { useState } from 'react';
import { connectWallet } from '../web3';

interface LoginProps {
  onConnected: (address: string) => void;
}

export function Login({ onConnected }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      const address = await connectWallet();
      onConnected(address);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">Giro</h1>
        <p className="text-gray-600 text-center mb-8">Marketplace Web3</p>
        
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Conectando...' : 'Conectar MetaMask'}
        </button>

        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}
