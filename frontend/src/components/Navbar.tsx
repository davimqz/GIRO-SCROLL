import { useState } from 'react';
import logoImg from '../components/assets/logo/giro_logo.png';

interface NavbarProps {
  userAddress: string;
  currentView: 'feed' | 'purchases' | 'profile';
  onNavigate: (view: 'feed' | 'purchases' | 'profile') => void;
  onDisconnect: () => void;
}

export function Navbar({
  userAddress,
  currentView,
  onNavigate,
  onDisconnect,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'feed', label: 'Feed' },
    { id: 'purchases', label: 'Minhas Compras' },
    { id: 'profile', label: 'Perfil' },
  ];

  const handleNavClick = (view: 'feed' | 'purchases' | 'profile') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{ backgroundColor: '#FBF7F1' }} className="shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Desktop e Mobile Header */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src={logoImg} alt="Giro" className="w-10 h-10" />
            <span className="text-gray-800 font-bold text-2xl">Giro</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as any)}
                className={`font-semibold transition ${
                  currentView === item.id
                    ? 'text-gray-900 border-b-2'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={currentView === item.id ? { borderColor: '#3FA18F' } : {}}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#f0f0f0' }}>
              <p className="text-sm font-mono text-gray-700">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </p>
            </div>
            <button
              onClick={onDisconnect}
              className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition font-semibold"
              style={{ backgroundColor: '#3FA18F' }}
            >
              Desconectar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu - Apenas informações de usuário e desconectar */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#f0f0f0' }}>
              <p className="text-sm font-mono text-gray-700">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </p>
            </div>
            <button
              onClick={onDisconnect}
              className="w-full text-white px-4 py-2 rounded-lg hover:opacity-90 transition font-semibold"
              style={{ backgroundColor: '#3FA18F' }}
            >
              Desconectar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
