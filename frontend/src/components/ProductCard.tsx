import { type Product } from '../hooks/useProducts';
import { useWallets } from '@privy-io/react-auth';
import { useBalance } from '../hooks/useBalance';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { wallets } = useWallets();
  const { balance } = useBalance();
  
  const mainImage = product.images?.[0] || 'https://via.placeholder.com/300x300?text=Product';

  const walletAddress = wallets[0]?.address?.toLowerCase();
  const isOwnProduct = product.seller_wallet?.toLowerCase() === walletAddress;
  const priceInGiro = parseFloat(product.price_giro || '0');
  const hasEnoughBalance = balance >= priceInGiro;
  const isSold = product.status === 'sold';
  const canBuy = !isSold && !isOwnProduct && hasEnoughBalance;

  return (
    <div 
      onClick={() => onViewDetails?.(product)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      {/* Imagem */}
      <div className="relative h-64 bg-gray-200 overflow-hidden group">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Image+Error';
          }}
        />
        
        {/* Condição do produto */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-white/90 text-gray-800 capitalize">
            {product.condition}
          </span>
        </div>

        {/* Status do Produto */}
        {isSold && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              Vendido
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Título */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.title}
        </h3>

        {/* Descrição */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Preço e Botão */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {priceInGiro.toFixed(2)} GIRO
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(product);
            }}
            disabled={isSold || isOwnProduct || !hasEnoughBalance}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isSold 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : isOwnProduct
                ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                : !hasEnoughBalance
                ? 'bg-red-300 text-red-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
            title={
              isSold 
                ? 'Produto já foi vendido'
                : isOwnProduct
                ? 'Este é seu produto'
                : !hasEnoughBalance
                ? `Saldo insuficiente (precisa de ${priceInGiro.toFixed(2)} GIRO)`
                : 'Comprar este produto'
            }
          >
            {isSold 
              ? 'Vendido'
              : isOwnProduct
              ? 'Seu Produto'
              : !hasEnoughBalance
              ? 'Sem Saldo'
              : 'Comprar'}
          </button>
        </div>

        {/* Vendedor */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
          <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
            {product.seller_wallet?.slice(2, 4).toUpperCase()}
          </div>
          <span className="font-medium truncate">{product.seller_wallet}</span>
          {isOwnProduct && <span className="text-blue-600 ml-auto font-semibold">✓ Seu</span>}
        </div>
      </div>
    </div>
  );
}
