import { useState, useEffect } from 'react';
import { setupAccountListener } from './web3';
import { LandingPage } from './components/LandingPage';
import { OnboardingModal } from './components/OnboardingModal';
import { Navbar } from './components/Navbar';
import { BottomNavigation } from './components/BottomNavigation';
import { Feed } from './components/Feed';
import { MyPurchases } from './components/MyPurchases';
import { CreatePost } from './components/CreatePost';

function App() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'feed' | 'purchases' | 'profile'>('feed');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if already connected
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
        }
      });
    }

    // Listen to account changes
    const unsubscribe = setupAccountListener((accounts: string[]) => {
      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
      } else {
        setUserAddress(null);
        setShowOnboarding(false);
      }
    });

    return unsubscribe;
  }, []);

  // Verificar se usuário precisa fazer onboarding
  useEffect(() => {
    if (userAddress) {
      const onboardingKey = `giro_onboarded_${userAddress.toLowerCase()}`;
      const hasOnboarded = localStorage.getItem(onboardingKey);
      
      if (!hasOnboarded) {
        setShowOnboarding(true);
      }
    }
  }, [userAddress]);

  if (!userAddress) {
    return <LandingPage onConnected={setUserAddress} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showOnboarding && userAddress && (
        <OnboardingModal
          userAddress={userAddress}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      <Navbar
        userAddress={userAddress}
        currentView={currentView}
        onNavigate={setCurrentView}
        onDisconnect={() => setUserAddress(null)}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Create Post Sidebar */}
          {currentView === 'feed' && (
            <div className="lg:col-span-1">
              <CreatePost
                onPostCreated={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </div>
          )}

          {/* Main Content */}
          <div className={currentView === 'feed' ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {currentView === 'feed' && (
              <Feed userAddress={userAddress} refreshTrigger={refreshTrigger} />
            )}
            {currentView === 'purchases' && (
              <MyPurchases userAddress={userAddress} refreshTrigger={refreshTrigger} />
            )}
            {currentView === 'profile' && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">Página de perfil em desenvolvimento</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {currentView === 'feed' && (
            <Feed userAddress={userAddress} refreshTrigger={refreshTrigger} />
          )}
          {currentView === 'purchases' && (
            <MyPurchases userAddress={userAddress} refreshTrigger={refreshTrigger} />
          )}
          {currentView === 'profile' && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">Página de perfil em desenvolvimento</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation
        currentView={currentView}
        onNavigate={setCurrentView}
        onPostCreated={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
}

export default App;
