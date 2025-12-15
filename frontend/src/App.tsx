import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import HowItWorks from "./components/HowItWorks";
import { OnboardingModal } from "./components/OnboardingModal";
import { ProductsList } from "./components/ProductsList";
import { MyPurchases } from "./components/MyPurchases";
import { BottomNavigation } from "./components/BottomNavigation";
import { CreateProductModal } from "./components/CreateProductModal";
import { supabase } from "./lib/supabase";

function App() {
  const { authenticated, user } = usePrivy();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [currentView, setCurrentView] = useState<'marketplace' | 'purchases'>('marketplace');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Scroll para marketplace quando conectar carteira
  useEffect(() => {
    if (authenticated) {
      const marketplaceSection = document.getElementById('marketplace');
      if (marketplaceSection) {
        marketplaceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [authenticated]);

  // Verifica se usuário já completou onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!authenticated || !user?.wallet?.address) {
        console.log('❌ Not checking onboarding: authenticated=', authenticated, 'wallet=', user?.wallet?.address);
        return;
      }

      const walletAddress = user.wallet.address.toLowerCase();
      console.log('🔍 Checking onboarding for wallet:', walletAddress);

      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("wallet_address", walletAddress)
          .single();

        console.log('👤 User data:', userData, 'Error:', userError);

        if (userData) {
          const { data: statusData, error: statusError } = await supabase
            .from("onboarding_status")
            .select("step_reward_claimed")
            .eq("user_id", userData.id)
            .single();

          console.log('📊 Status data:', statusData, 'Error:', statusError);

          if (!statusData?.step_reward_claimed) {
            // Usuário não completou onboarding, mostrar modal
            console.log('✅ Showing onboarding modal - reward not claimed');
            setShowOnboarding(true);
          } else {
            console.log('⏭️ Onboarding already completed');
          }
        } else {
          // Novo usuário, mostrar onboarding
          console.log('✅ Showing onboarding modal - new user');
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("❌ Error checking onboarding status:", error);
        // Em caso de erro, mostrar onboarding por segurança
        setShowOnboarding(true);
      }
    };

    checkOnboardingStatus();
  }, [authenticated, user]);

  return (
    <div className="min-h-screen">
      {isTransitioning && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      )}
      
      <Navbar 
        currentView={currentView}
        onNavigateMarketplace={() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentView('marketplace');
            setIsTransitioning(false);
          }, 600);
        }}
        onNavigatePurchases={() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentView('purchases');
            setIsTransitioning(false);
          }, 600);
        }}
      />
      {!authenticated && (
        <>
          <Hero />
          <HowItWorks />
        </>
      )}
      
      {/* Marketplace Products - Somente quando autenticado */}
      {authenticated && currentView === 'marketplace' && <ProductsList />}
      
      {/* Minhas Compras - Somente quando autenticado e na view correta */}
      {authenticated && currentView === 'purchases' && <MyPurchases />}
      
      {!isTransitioning && <Footer authenticated={authenticated} />}
      
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Bottom Navigation - Mobile */}
      <BottomNavigation
        visible={authenticated}
        currentView={currentView}
        onAddProduct={() => setShowCreateProduct(true)}
        onMyPurchases={() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentView('purchases');
            setIsTransitioning(false);
          }, 600);
        }}
        onGoToMarketplace={() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentView('marketplace');
            setIsTransitioning(false);
          }, 600);
        }}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateProduct}
        onClose={() => setShowCreateProduct(false)}
        onSuccess={() => {
          setShowCreateProduct(false);
          console.log('Product created successfully!');
        }}
      />
    </div>
  );
}

export default App;
