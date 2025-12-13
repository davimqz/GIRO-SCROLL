import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { type Product } from '../hooks/useProducts';
import { useBalance } from '../hooks/useBalance';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy?: (product: Product) => void;
}

export function ProductDetailModal({ product, isOpen, onClose, onBuy }: ProductDetailModalProps) {
  const { wallets } = useWallets();
  const { balance, isLoading: isBalanceLoading } = useBalance();
  const [sellerName, setSellerName] = useState<string>('');
  const [isLoadingSellerName, setIsLoadingSellerName] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBuying, setIsBuying] = useState(false);

  const walletAddress = wallets[0]?.address?.toLowerCase();
  const isOwnProduct = product?.seller_wallet?.toLowerCase() === walletAddress;

  // Calcula se tem saldo suficiente
  const productPrice = typeof product?.price_giro === 'string' 
    ? parseFloat(product.price_giro) 
    : product?.price_giro || 0;
  const productPriceInWei = BigInt(Math.floor(productPrice) * 10 ** 18);
  const hasEnoughBalance = balance >= productPriceInWei;

  // Busca o nome do vendedor do produto
  useEffect(() => {
    const fetchSellerName = async () => {
      if (!product?.seller_wallet) {
        setSellerName('');
        return;
      }

      setIsLoadingSellerName(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name')
          .eq('wallet_address', product.seller_wallet.toLowerCase())
          .single();

        if (error) {
          console.warn('Could not fetch seller name:', error);
          setSellerName('Usuário Anônimo');
          return;
        }

        setSellerName(data?.name || 'Usuário Anônimo');
      } catch (err) {
        console.error('Error fetching seller name:', err);
        setSellerName('Usuário Anônimo');
      } finally {
        setIsLoadingSellerName(false);
      }
    };

    fetchSellerName();
  }, [product?.seller_wallet]);

  // Reset image index quando modal abre
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

  if (!isOpen || !product) return null;

  const images = product.images || [];
  const currentImage = images[currentImageIndex] || '';

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleBuy = async () => {
    if (isOwnProduct) return;
    
    setIsBuying(true);
    try {
      await onBuy?.(product);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
        >
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden h-96">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {/* Image Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all shadow-md"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all shadow-md"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={`thumbnail-${idx}`}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative h-20 rounded-lg overflow-hidden transition-all ${
                      idx === currentImageIndex
                        ? 'ring-2 ring-blue-600'
                        : 'ring-1 ring-gray-200 hover:ring-gray-400'
                    }`}
                  >
                    <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-blue-600 mb-2">{formatPrice(product.price_giro)}</p>
              <p className="text-sm text-gray-600">Preço total do produto</p>
            </div>

            {/* Product Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
              {/* Condition */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Condição</p>
                <p className="font-medium text-gray-900 capitalize">
                  {product.condition === 'like_new' ? 'Like New' : product.condition}
                </p>
              </div>

              {/* Size */}
              {product.size && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tamanho</p>
                  <p className="font-medium text-gray-900">{product.size}</p>
                </div>
              )}

              {/* Category */}
              {product.category && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categoria</p>
                  <p className="font-medium text-gray-900">{product.category}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className={`font-medium ${product.status === 'sold' ? 'text-red-600' : 'text-green-600'}`}>
                  {product.status === 'sold' ? 'Vendido' : 'Disponível'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Vendedor</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {isLoadingSellerName ? '...' : sellerName}
                  </p>
                </div>
              </div>
              {isOwnProduct && <p className="text-xs text-blue-600 mt-2 font-medium">✓ Este é seu produto</p>}
            </div>

            {/* User Balance Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Seu Saldo</p>
                {isBalanceLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {(Number(balance) / 10 ** 18).toFixed(2)} GIRO
              </p>

              {/* Balance Status */}
              {!isOwnProduct && product.status !== 'sold' && (
                <div className="mt-3">
                  {hasEnoughBalance ? (
                    <p className="text-sm text-green-700 flex items-center gap-1">
                      <span className="text-lg">✓</span>
                      Você tem saldo suficiente para comprar
                    </p>
                  ) : (
                    <p className="text-sm text-red-700 flex items-center gap-1">
                      <span className="text-lg">!</span>
                      Saldo insuficiente. Você precisa de mais{' '}
                      <span className="font-semibold">
                        {((productPriceInWei - balance) / BigInt(10 ** 18)).toString()} GIRO
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Buy Button */}
            {product.status !== 'sold' && (
              <button
                onClick={handleBuy}
                disabled={isBuying || isOwnProduct || !hasEnoughBalance}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                  isOwnProduct
                    ? 'bg-gray-400 cursor-not-allowed'
                    : !hasEnoughBalance
                      ? 'bg-red-400 cursor-not-allowed'
                      : isBuying
                        ? 'bg-blue-600 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                {isOwnProduct 
                  ? 'Este é seu produto' 
                  : !hasEnoughBalance 
                    ? 'Saldo Insuficiente' 
                    : isBuying 
                      ? 'Processando...' 
                      : 'Comprar Agora'}
              </button>
            )}

            {product.status === 'sold' && (
              <div className="w-full py-3 rounded-lg font-semibold text-center bg-gray-200 text-gray-700">
                Produto Vendido
              </div>
            )}

            {/* Close Button Mobile */}
            <button
              onClick={onClose}
              className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors md:hidden"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
