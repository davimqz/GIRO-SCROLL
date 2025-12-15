import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../hooks/useUser";
import Logo from "../assets/logo/giro_logo.png";
import { CreateProductModal } from "./CreateProductModal";

interface NavbarProps {
  currentView?: 'marketplace' | 'purchases';
  onNavigateMarketplace?: () => void;
  onNavigatePurchases?: () => void;
}

export default function Navbar({ currentView, onNavigateMarketplace, onNavigatePurchases }: NavbarProps) {
  const { authenticated, login, logout } = usePrivy();
  const { user } = useUser();
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-[#fbf7f1] shadow z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

          {/* ESQUERDA - Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src={Logo} className="h-8 w-8 object-contain" />
            <span className="font-semibold text-lg">Giro</span>
          </div>

          {/* CENTRO - Nav List (somente quando não autenticado) */}
          <ul className="hidden md:flex items-center gap-10 text-sm font-medium mx-auto">
            {!authenticated && (
              <>
                <li className="cursor-pointer text-black hover:text-[#45BCA0] transition">Home</li>
                <li className="cursor-pointer text-black hover:text-[#45BCA0] transition">Sobre Nós</li>
                <li className="cursor-pointer text-black hover:text-[#45BCA0] transition">Planos</li>
              </>
            )}
            {authenticated && (
              <>
                <li 
                  onClick={onNavigateMarketplace}
                  className={`cursor-pointer transition font-semibold ${
                    currentView === 'marketplace' 
                      ? 'text-[#45BCA0]' 
                      : 'text-black hover:text-[#45BCA0]'
                  }`}
                >
                  Feed
                </li>
                <li 
                  onClick={onNavigatePurchases}
                  className={`cursor-pointer transition font-semibold ${
                    currentView === 'purchases' 
                      ? 'text-[#45BCA0]' 
                      : 'text-black hover:text-[#45BCA0]'
                  }`}
                >
                  Minhas Compras
                </li>
                <li className="cursor-pointer text-black hover:text-[#45BCA0] transition">Meu Perfil</li>
              </>
            )}
          </ul>

          {/* DIREITA - Buttons e Menu Hamburguer */}
          <div className="flex items-center gap-2 md:gap-3">
            {authenticated && (
              <button
                onClick={() => setShowCreateProduct(true)}
                className="hidden sm:flex px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-semibold"
              >
                + List Product
              </button>
            )}
            
            {!authenticated && (
              <button
                onClick={login}
                className="hidden md:flex px-4 py-2 bg-[#45BCA0] text-white rounded-md hover:bg-[#3FA18F] transition text-sm font-semibold"
              >
                Login
              </button>
            )}

            {authenticated && (
              <button
                onClick={logout}
                className="hidden md:flex px-4 py-2 bg-[#45BCA0] text-white rounded-md hover:bg-[#3FA18F] transition text-sm items-center gap-2"
              >
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-[#45BCA0]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                {user?.name ? user.name : 'User'}
              </button>
            )}

            {/* Menu Hamburguer - Mobile */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-200 rounded-md transition"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {!showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            </button>
          </div>

        </div>

        {/* MOBILE MENU */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-[#fbf7f1]">
            <div className="px-4 py-3 space-y-3 flex flex-col items-center">
              {/* Navigation Links - Somente quando não autenticado */}
              {!authenticated && (
                <>
                  <div className="py-2 px-2 hover:bg-gray-100 rounded cursor-pointer text-sm font-medium text-black">
                    Home
                  </div>
                  <div className="py-2 px-2 hover:bg-gray-100 rounded cursor-pointer text-sm font-medium text-black">
                    Sobre Nós
                  </div>
                  <div className="py-2 px-2 hover:bg-gray-100 rounded cursor-pointer text-sm font-medium text-black">
                    Planos
                  </div>
                  
                  {/* Login Button - Mobile Menu */}
                  <button
                    onClick={() => {
                      login();
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-2 bg-[#45BCA0] text-white rounded-md hover:bg-[#3FA18F] transition text-sm font-semibold mt-2"
                  >
                    Login
                  </button>
                </>
              )}

              {/* User Button - Mobile */}
              {authenticated && (
                <button
                  onClick={() => {
                    logout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2 bg-[#45BCA0] text-white rounded-md hover:bg-[#3FA18F] transition text-sm flex items-center justify-center gap-2"
                >
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-[#45BCA0]">
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  {user?.name ? user.name : 'User'}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateProduct}
        onClose={() => setShowCreateProduct(false)}
        onSuccess={() => {
          setShowMobileMenu(false);
          console.log('Product created successfully!');
        }}
      />

      {/* Spacer para empurrar o conteúdo */}
      
    </>
  );
}
