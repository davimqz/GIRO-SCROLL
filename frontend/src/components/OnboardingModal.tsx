import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useOnboarding, type OnboardingData } from '../hooks/useOnboarding';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { login } = usePrivy();
  const {
    currentStep,
    isLoading,
    error,
    authenticated,
    walletAddress,
    connectWallet,
    completeProfile,
    claimReward,
    setError,
  } = useOnboarding();

  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    email: '',
  });

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!authenticated) {
      await login();
    } else {
      await connectWallet();
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    const success = await completeProfile(formData);
    if (!success) {
      setError('Failed to complete profile');
    }
  };

  const handleClaimReward = async () => {
    const success = await claimReward();
    if (success) {
      // Fecha o modal após alguns segundos para mostrar o sucesso
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-light"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Giro! 🎉
          </h2>
          <p className="text-gray-600">Complete your onboarding and earn 50 GIRO tokens</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < 4 && (
                <div
                  className={`w-12 h-1 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Connect Wallet */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-6">
                Connect your wallet to get started with Giro Marketplace
              </p>
            </div>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : authenticated ? 'Continue' : 'Connect Wallet'}
            </button>
          </div>
        )}

        {/* Step 2: Complete Profile */}
        {currentStep === 2 && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-gray-600">Tell us a bit about yourself</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="text-xs text-gray-500">
              <p>Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        )}

        {/* Step 3: Claim Reward */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Claim Your Reward! 🎁</h3>
              <p className="text-gray-600 mb-4">
                You're all set! Claim your 50 GIRO tokens as a welcome gift.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-4xl font-bold text-blue-600">50 GIRO</p>
                <p className="text-sm text-gray-600 mt-1">Onboarding Reward</p>
              </div>
            </div>
            <button
              onClick={handleClaimReward}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Claiming...' : 'Claim Reward'}
            </button>
            <p className="text-xs text-center text-gray-500">
              This will require a transaction confirmation
            </p>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Giro! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Your 50 GIRO tokens have been successfully claimed!
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-3xl font-bold text-green-600">50 GIRO</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
