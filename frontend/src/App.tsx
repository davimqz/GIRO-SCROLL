import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import HowItWorks from "./components/HowItWorks";
import { OnboardingModal } from "./components/OnboardingModal";
import { supabase } from "./lib/supabase";

function App() {
  const { authenticated, user } = usePrivy();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Verifica se usuário já completou onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!authenticated || !user?.wallet?.address) return;

      const walletAddress = user.wallet.address.toLowerCase();

      try {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("wallet_address", walletAddress)
          .single();

        if (userData) {
          const { data: statusData } = await supabase
            .from("onboarding_status")
            .select("step_reward_claimed")
            .eq("user_id", userData.id)
            .single();

          if (!statusData?.step_reward_claimed) {
            // Usuário não completou onboarding, mostrar modal
            setShowOnboarding(true);
          }
        } else {
          // Novo usuário, mostrar onboarding
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, [authenticated, user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Footer />
      
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}

export default App;
