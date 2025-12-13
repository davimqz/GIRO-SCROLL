import { type Product } from '../hooks/useProducts';
import { formatPrice, translateCondition, getConditionColor } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const mainImage = product.images[0] || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
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
        
        {/* Badge de condição */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getConditionColor(product.condition)}`}>
            {translateCondition(product.condition)}
          </span>
        </div>

        {/* Indicador de múltiplas imagens */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {product.images.length}
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

        {/* Metadados */}
        <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
          {product.size && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {product.size}
            </span>
          )}
          {product.category && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {product.category}
            </span>
          )}
        </div>

        {/* Preço e Botão */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formatPrice(product.price_giro)}
            </p>
          </div>
          <button
            onClick={() => onViewDetails?.(product)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            Ver Detalhes
          </button>
        </div>

        {/* Vendedor */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
          <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
            ?
          </div>
          <span className="font-medium">
            Usuário
          </span>
        </div>
      </div>
    </div>
  );
}
