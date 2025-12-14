import { useWallets } from '@privy-io/react-auth';
import { type Product } from '../hooks/useProducts';
import { useMarketplace } from '../hooks/useMarketplace';
import { useBalance } from '../hooks/useBalance';
import { parseEther } from 'viem';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy?: (product: Product) => void;
}

export function ProductDetailModal({ product, isOpen, onClose, onBuy }: ProductDetailModalProps) {
  const { wallets } = useWallets();
  const { balance } = useBalance();
  const { buyProduct } = useMarketplace();
  const [isBuying, setIsBuying] = useState(false);

  const walletAddress = wallets[0]?.address?.toLowerCase();

  if (!isOpen || !product) return null;

  const isOwnProduct = product.seller_wallet?.toLowerCase() === walletAddress;
  const priceInGiro = parseFloat(product.price_giro || '0');
  const hasEnoughBalance = balance >= priceInGiro;
  const isSold = product.status === 'sold';

  const handleBuy = async () => {
    if (isOwnProduct || isSold || !walletAddress) {
      alert('Cannot buy this product');
      return;
    }

    if (!hasEnoughBalance) {
      alert('Insufficient GIRO balance');
      return;
    }

    setIsBuying(true);

    try {
      console.log('🔄 Starting purchase process...');
      
      // Verificar se produto tem blockchain_product_id
      const blockchainProductId = (product as any).blockchain_product_id;
      
      if (!blockchainProductId) {
        alert('⚠️ Este produto ainda não foi listado no blockchain. Não é possível comprar ainda.');
        setIsBuying(false);
        return;
      }

      // Há integração com blockchain - executar transação PRIMEIRO
      console.log('⛓️ Executing blockchain transaction...');
      const priceInWei = parseEther(priceInGiro.toString());
      
      const success = await buyProduct(BigInt(blockchainProductId), priceInWei);
      
      if (!success) {
        console.error('❌ Blockchain transaction failed');
        alert('❌ Blockchain transaction failed. Please try again.');
        setIsBuying(false);
        return;
      }
      
      console.log('✅ Blockchain transaction successful');
      
      // AGORA que blockchain confirmou, atualizar Supabase
      console.log('📝 Updating product status in Supabase...');
      const { error: updateError } = await supabase
        .from('products')
        .update({
          status: 'sold',
          sold_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (updateError) {
        console.error('❌ Product update error:', updateError);
        alert('⚠️ Blockchain transaction succeeded but failed to update database. Please refresh the page.');
        setIsBuying(false);
        return;
      }

      // Registrar transação no banco
      console.log('📝 Recording transaction...');
      console.log('👤 Buyer wallet:', walletAddress);
      console.log('💼 Seller wallet:', product.seller_wallet);
      
      const { data: buyerData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      console.log('🔍 Buyer data:', buyerData);

      const { data: sellerData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', product.seller_wallet)
        .single();

      console.log('🔍 Seller data:', sellerData);

      if (buyerData && sellerData) {
        const transactionData = {
          product_id: product.id,
          buyer_id: buyerData.id,
          seller_id: sellerData.id,
          buyer_wallet: walletAddress,
          seller_wallet: product.seller_wallet,
          amount_giro: product.price_giro,
          transaction_hash: 'supabase-' + Date.now().toString(),
          status: 'completed',
        };
        
        console.log('📋 Inserting transaction:', transactionData);
        
        const { error: transactionError, data: transactionResult } = await supabase
          .from('transactions')
          .insert(transactionData);

        console.log('📊 Transaction insert result:', transactionResult);
        console.log('❌ Transaction error:', transactionError);

        if (transactionError) {
          console.error('⚠️ Transaction record error:', transactionError);
        }
      } else {
        console.error('❌ Missing buyer or seller data');
        console.error('Buyer:', buyerData, 'Seller:', sellerData);
      }

      console.log('✅ Purchase completed successfully');
      alert('✅ Product purchased successfully!');
      onBuy?.(product);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error('Error in handleBuy:', error);
      alert('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsBuying(false);
    }
  };

  const mainImage = product.images?.[0] || 'https://via.placeholder.com/400x400?text=Product';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
        >
          ×
        </button>

        <div className="space-y-6">
          {/* Image */}
          <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden h-64 flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <svg className="w-24 h-24 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-blue-600 font-medium">Product Image</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
          </div>

          {/* Condition Badge */}
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
              {product.condition}
            </span>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Descrição</h2>
            <p className="text-gray-600 text-base">{product.description}</p>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Preço</p>
            <p className="text-4xl font-bold text-blue-600">
              {priceInGiro.toFixed(2)} GIRO
            </p>
          </div>

          {/* Seller */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Vendedor</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700">
                {product.seller_wallet.slice(2, 4).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 truncate">{product.seller_wallet}</span>
            </div>
          </div>

          {/* Status Badge */}
          {isSold && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-center text-red-600 font-semibold">Este produto já foi vendido</p>
            </div>
          )}

          {/* Balance Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Seu Saldo GIRO</p>
            <p className="text-lg font-semibold text-gray-900">
              {(Number(balance) / 1e18).toFixed(2)} GIRO
            </p>
            {!hasEnoughBalance && !isOwnProduct && (
              <p className="text-xs text-red-600 mt-2">❌ Saldo insuficiente</p>
            )}
          </div>

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            disabled={
              isBuying ||
              isOwnProduct ||
              isSold ||
              !hasEnoughBalance ||
              !walletAddress
            }
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isOwnProduct
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : isSold
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : !hasEnoughBalance
                ? 'bg-red-300 text-red-700 cursor-not-allowed'
                : isBuying
                ? 'bg-blue-400 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isOwnProduct
              ? 'Seu Produto'
              : isSold
              ? 'Já Foi Vendido'
              : !hasEnoughBalance
              ? 'Saldo Insuficiente'
              : isBuying
              ? 'Processando compra...'
              : 'Comprar Agora'}
          </button>

          {/* Info */}
          {!isOwnProduct && !isSold && (
            <p className="text-xs text-center text-gray-500">
              💡 Ao comprar este produto, {priceInGiro.toFixed(2)} tokens GIRO serão queimados
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
