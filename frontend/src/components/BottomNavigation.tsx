import { useState } from 'react';

interface BottomNavigationProps {
  onAddProduct: () => void;
  onMyPurchases: () => void;
  onGoToMarketplace: () => void;
  currentView?: 'marketplace' | 'purchases';
  visible?: boolean;
}

export function BottomNavigation({ 
  onAddProduct, 
  onMyPurchases, 
  onGoToMarketplace,
  currentView = 'marketplace',
  visible = true 
}: BottomNavigationProps) {
  const [activeTab, setActiveTab] = useState(currentView);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex items-center justify-around h-20 px-4">
        {/* Minhas Compras */}
        <button
          onClick={() => {
            setActiveTab('purchases');
            onMyPurchases();
          }}
          className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
            activeTab === 'purchases'
              ? 'text-blue-600'
              : 'text-black hover:text-blue-600 active:text-blue-600'
          }`}
          title="Minhas Compras"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>

        {/* Add Product - Central */}
        <button
          onClick={onAddProduct}
          className="flex items-center justify-center -mt-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition-all active:scale-95 hover:scale-110"
          title="Adicionar Produto"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Feed */}
        <button
          onClick={() => {
            setActiveTab('marketplace');
            onGoToMarketplace();
          }}
          className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
            activeTab === 'marketplace'
              ? 'text-black'
              : 'text-black hover:text-blue-600 active:text-blue-600'
          }`}
          title="Feed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
