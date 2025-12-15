import { useState } from 'react';
import { Contract } from 'ethers';
import { getSigner } from '../web3';
import { CONTRACT_ADDRESSES, GIRO_TOKEN_ABI } from '../config';

interface OnboardingModalProps {
  userAddress: string;
  onComplete: () => void;
}

export function OnboardingModal({ userAddress, onComplete }: OnboardingModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      setError('Preencha todos os campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Chamar claimOnboarding no contrato
      const signer = await getSigner();
      const token = new Contract(
        CONTRACT_ADDRESSES.giroToken,
        GIRO_TOKEN_ABI,
        signer
      );

      const tx = await token.claimOnboarding();
      await tx.wait();

      // Salvar no localStorage
      localStorage.setItem(
        `giro_onboarded_${userAddress.toLowerCase()}`,
        JSON.stringify({
          name,
          email,
          completedAt: new Date().toISOString()
        })
      );

      console.log(`Onboarding completo para ${name} (${email}) - 50 GIRO recebidos!`);
      
      // Aguardar um pouco antes de fechar para feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Erro ao completar onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Giro!</h2>
          <p className="text-blue-100">Receba 50 tokens GIRO para começar</p>
        </div>

        {/* Conteúdo */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seu nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              maxLength={100}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seu email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: joao@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">🎁 Bônus de boas-vindas:</span> Você receberá <span className="font-bold text-blue-600">50 GIRO</span> para começar a comprar e vender!
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading || !name || !email}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Processando...' : 'Completar Cadastro'}
          </button>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            Seus dados serão usados apenas para notificações e suporte
          </p>
        </form>
      </div>
    </div>
  );
}
