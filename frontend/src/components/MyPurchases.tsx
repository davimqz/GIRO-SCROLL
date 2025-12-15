import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '../lib/supabase';
import { type Product } from '../hooks/useProducts';
import { ProductDetailModal } from './ProductDetailModal';

export function MyPurchases() {
  const { user } = usePrivy();
  const [purchases, setPurchases] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchPurchases = async () => {
    if (!user?.wallet?.address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const walletAddress = user.wallet.address.toLowerCase();
      console.log('🔍 Fetching purchases for wallet:', walletAddress);

      // Buscar transações onde o usuário é comprador
      const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('buyer_wallet', walletAddress)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      console.log('📊 Transactions found:', transactions);
      console.log('❌ Fetch error:', fetchError);

      if (fetchError) {
        throw fetchError;
      }

      // Para cada transação, buscar os dados do produto
      const purchasesList: Product[] = [];
      
      console.log('🔄 Processing transactions...');
      if (transactions && transactions.length > 0) {
        console.log(`📦 Found ${transactions.length} transactions`);
        for (const tx of transactions) {
          console.log('📍 Processing transaction:', tx.id, 'Product ID:', tx.product_id);
          if (tx.product_id) {
            const { data: product, error: productError } = await supabase
              .from('products')
              .select('*')
              .eq('id', tx.product_id)
              .single();
            
            console.log('📦 Product result:', product, 'Error:', productError);
            if (product && !productError) {
              purchasesList.push(product);
            }
          }
        }
      } else {
        console.log('ℹ️ No transactions found');
      }

      console.log('✅ Final purchases list:', purchasesList);
      setPurchases(purchasesList);
    } catch (err: any) {
      console.error('Erro ao buscar compras:', err);
      setError(err.message || 'Erro ao carregar compras');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [user?.wallet?.address]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando compras...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-32 md:pb-12 min-h-screen bg-gradient-to-b from-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Minhas Compras</h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Oops! Algo deu errado</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Não conseguimos carregar suas compras no momento. Por favor, tente novamente mais tarde.
              </p>
              <button
                onClick={fetchPurchases}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="pt-24 pb-32 md:pb-12 min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Minhas Compras</h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              {/* Ilustração com gradient */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sua jornada começa aqui!</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Você ainda não realizou nenhuma compra. Explore nosso marketplace e descubra produtos incríveis esperando por você.
              </p>
              
              {/* Dados interessantes */}
              <div className="bg-white rounded-lg p-4 mb-6 shadow-md border border-blue-100">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">💰 Ganhe GIRO a cada compra realizada</p>
                  <p className="mb-2">🎁 Desbloqueie recompensas especiais</p>
                  <p>🔄 Participe da economia circular</p>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Clique em "Minhas Compras" para voltar ao marketplace</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 md:pb-12 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Minhas Compras</h1>
          <button
            onClick={fetchPurchases}
            disabled={isLoading}
            className="px-2 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 md:gap-2 flex-shrink-0 disabled:opacity-50"
            title="Atualizar compras"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>

        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              onClick={() => setSelectedProduct(purchase)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex gap-4 p-4">
                {/* Imagem do Produto */}
                <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden flex items-center justify-center">
                  {purchase.images && purchase.images.length > 0 ? (
                    <img src={purchase.images[0]} alt={purchase.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                {/* Informações do Produto */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {purchase.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {purchase.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valor pago:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {purchase.price_giro} GIRO
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
