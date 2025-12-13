import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useProducts, type CreateProductData } from '../hooks/useProducts';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementNotification } from './AchievementNotification';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
  const { wallets } = useWallets();
  const { createProduct, isLoading, error, setError } = useProducts();
  const { achievements, fetchAchievements, claimFirstListingReward } = useAchievements();

  const walletAddress = wallets[0]?.address?.toLowerCase();

  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  const [achievementAmount, setAchievementAmount] = useState(0);

  const [formData, setFormData] = useState<Omit<CreateProductData, 'images'>>({
    title: '',
    description: '',
    price: 0,
    condition: 'good',
    size: '',
    category: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Verifica achievements após abrir modal (DEVE vir antes do early return)
  useEffect(() => {
    if (isOpen && walletAddress) {
      // Só tenta buscar achievements se a wallet está conectada
      // Se o usuário ainda está no onboarding, isso retornará null gracefully
      fetchAchievements();
    }
  }, [isOpen, walletAddress, fetchAchievements]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length < 2) {
      setError('Please select at least 2 images');
      return;
    }

    if (files.length > 4) {
      setError('Maximum 4 images allowed');
      return;
    }

    setImages(files);
    
    // Cria previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setError(null);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Libera memória da preview removida
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length < 2 || images.length > 4) {
      setError('Please upload between 2 and 4 images');
      return;
    }

    if (!formData.title || !formData.description || formData.price <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    const productData: CreateProductData = {
      ...formData,
      images,
    };

    const success = await createProduct(productData);
    
    if (success) {
      console.log('✅ Product created successfully!');
      
      // Limpa o formulário
      setFormData({
        title: '',
        description: '',
        price: 0,
        condition: 'good',
        size: '',
        category: '',
      });
      setImages([]);
      setImagePreviews([]);
      
      // Verifica se é o primeiro produto (será elegível após contador incrementar)
      console.log('🔄 Fetching initial achievements...');
      await fetchAchievements();
      
      // Fecha o modal e callback
      onSuccess?.();
      onClose();

      // Aguarda 2 segundos e verifica se pode reclamar reward
      setTimeout(async () => {
        console.log('⏰ Checking achievements after 2 seconds...');
        await fetchAchievements();
        
        console.log('📊 Current achievements state:', achievements);
        
        if (achievements?.canClaimFirstListing) {
          console.log('🎁 Can claim first listing! Attempting to claim...');
          try {
            console.log('💰 Calling claimFirstListingReward()...');
            await claimFirstListingReward();
            console.log('✅ Reward claimed successfully!');
            setAchievementMessage('Primeiro produto listado!');
            setAchievementAmount(10);
            setShowAchievement(true);
          } catch (err) {
            console.error('❌ Failed to claim first listing reward:', err);
          }
        } else {
          console.warn('⚠️ Cannot claim first listing reward. canClaimFirstListing:', achievements?.canClaimFirstListing);
          console.warn('📈 Current listingsCount:', achievements?.listingsCount);
        }
      }, 2000);
    }
  };

  return (
    <>
      <AchievementNotification
        show={showAchievement}
        amount={achievementAmount}
        message={achievementMessage}
        onClose={() => setShowAchievement(false)}
      />

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 relative my-auto">
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-light"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">List Your Product</h2>
        <p className="text-gray-600 text-sm mb-4">Fill in the details to create your listing</p>

        {/* First Listing Reward Banner - Mostrar apenas na primeira postagem */}
        {achievements?.listingsCount === 0 && achievements?.canClaimFirstListing && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-xl">🎁</span>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 text-sm mb-1">Recompensa do Primeiro Anúncio!</h3>
                <p className="text-xs text-green-700">
                  Ganhe <strong>10 GIRO</strong> ao publicar seu primeiro produto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images * (2-4 images)
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to upload images or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </span>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Nike Air Max 90 - Size 42"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product in detail..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Price & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Price (GIRO) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="10"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          {/* Size & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Size (optional)
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., M, 42, One Size"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category (optional)
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Sneakers, Electronics"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || images.length < 2}
              className={`flex-1 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                achievements?.listingsCount === 0 && achievements?.canClaimFirstListing
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading 
                ? 'Creating...' 
                : achievements?.listingsCount === 0 && achievements?.canClaimFirstListing
                  ? 'Publicar 🎁' 
                  : 'List Product'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}
