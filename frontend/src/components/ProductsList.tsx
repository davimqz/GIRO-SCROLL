import { useEffect, useState } from 'react';
import { useProducts, type Product } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';

export function ProductsList() {
  const { products, fetchProducts, isLoading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold mb-2">Failed to load products</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sem anúncios no momento</h3>
          <p className="text-gray-600">Seja o primeiro a listar um produto no marketplace!</p>
        </div>
      </div>
    );
  }

  return (
    <div id="marketplace" className="pt-20 pb-16 md:pb-12 min-h-screen flex flex-col">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Marketplace</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
          <button
            onClick={fetchProducts}
            className="px-2 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 md:gap-2 flex-shrink-0 mt-1"
            title="Atualizar produtos"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Grid de produtos */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onBuy={(product) => {
          console.log('Buy product:', product);
          // TODO: Implementar compra
        }}
      />
    </div>
  );
}
