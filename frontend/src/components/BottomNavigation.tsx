import { useState } from 'react';
import { CreatePost } from './CreatePost';

interface BottomNavigationProps {
  userAddress: string;
  currentView: 'feed' | 'purchases' | 'profile';
  onNavigate: (view: 'feed' | 'purchases' | 'profile') => void;
  onPostCreated: () => void;
}

export function BottomNavigation({ 
  userAddress, 
  currentView, 
  onNavigate,
  onPostCreated 
}: BottomNavigationProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handlePostCreated = () => {
    setShowCreateModal(false);
    onPostCreated();
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="flex justify-between items-center h-20 max-w-full">
          {/* Minhas Compras */}
          <button
            onClick={() => onNavigate('purchases')}
            className={`flex-1 flex flex-col items-center justify-center h-full transition ${
              currentView === 'purchases'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-xs font-semibold">Compras</span>
          </button>

          {/* Create Post Button (Center) */}
          <button
            onClick={handleCreateClick}
            className="absolute left-1/2 transform -translate-x-1/2 -top-8 w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg transition"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          {/* Feed de Publicações (Hamburger Menu) */}
          <button
            onClick={() => onNavigate('feed')}
            className={`flex-1 flex flex-col items-center justify-center h-full transition ${
              currentView === 'feed'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="text-xs font-semibold">Feed</span>
          </button>
        </div>
      </nav>

      {/* Create Post Modal/Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-50 flex items-end">
          <div className="w-full bg-white rounded-t-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between p-4">
              <h2 className="text-xl font-bold">Criar Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 pb-24">
              <CreatePost
                userAddress={userAddress}
                onPostCreated={handlePostCreated}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
