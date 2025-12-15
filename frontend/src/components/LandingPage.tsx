import { useState } from 'react';
import { connectWallet } from '../web3';
import logoImg from '../components/assets/logo/giro_logo.png';
import { HeroSection } from './HeroSection';
import { HowItWorks } from './HowItWorks';
import { Plans } from './Plans';
import { Footer } from './Footer';

interface LandingPageProps {
  onConnected: (address: string) => void;
}

export function LandingPage({ onConnected }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleConnect = async () => {
    try {
      const address = await connectWallet();
      onConnected(address);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBF7F1' }}>
      {/* Navbar */}
      <nav className="border-b border-gray-200" style={{ backgroundColor: '#FBF7F1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={logoImg} alt="Giro" className="w-10 h-10" />
              <span className="text-gray-800 font-bold text-2xl">Giro</span>
            </div>

            {/* Links - Desktop */}
            <div className="hidden md:flex items-center space-x-12">
              <a href="#home" className="text-gray-700 hover:text-gray-900 transition font-medium">
                Home
              </a>
              <a href="#sobre" className="text-gray-700 hover:text-gray-900 transition font-medium">
                Sobre Nós
              </a>
              <a href="#planos" className="text-gray-700 hover:text-gray-900 transition font-medium">
                Planos
              </a>
            </div>

            {/* Login Button - Desktop */}
            <button
              onClick={handleConnect}
              className="hidden md:block text-white font-bold py-2 px-6 rounded-lg transition shadow-md hover:opacity-90"
              style={{ backgroundColor: '#3FA18F' }}
            >
              Login
            </button>

            {/* Hamburger Menu - Mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden pb-6 space-y-4">
              <a
                href="#home"
                className="block text-center text-gray-700 hover:text-gray-900 transition font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#sobre"
                className="block text-center text-gray-700 hover:text-gray-900 transition font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Sobre Nós
              </a>
              <a
                href="#planos"
                className="block text-center text-gray-700 hover:text-gray-900 transition font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Planos
              </a>

              {/* Login Button - Mobile */}
              <button
                onClick={() => {
                  handleConnect();
                  setMenuOpen(false);
                }}
                className="w-full text-white font-bold py-3 px-6 rounded-lg transition shadow-md hover:opacity-90 mt-4"
                style={{ backgroundColor: '#3FA18F' }}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onGetStarted={handleConnect} />

      {/* How It Works Section */}
      <HowItWorks onGetStarted={handleConnect} />

      {/* Plans Section */}
      <Plans />

      {/* Footer */}
      <Footer />
    </div>
  );
}
