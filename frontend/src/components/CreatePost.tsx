import { useState } from 'react';
import { Contract } from 'ethers';
import { getSigner } from '../web3';
import { CONTRACT_ADDRESSES, GIRO_MARKETPLACE_ABI } from '../config';

interface CreatePostProps {
  userAddress: string;
  onPostCreated: () => void;
}

const CATEGORIES = ['Arte', 'Música', 'Vídeo', 'Fotografia', 'Design', 'Outro'];

export function CreatePost({ userAddress, onPostCreated }: CreatePostProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Arte');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem deve ter menos de 5MB');
        return;
      }
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem deve ter menos de 5MB');
        return;
      }
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Por favor, solte uma imagem válida');
    }
  };

  const uploadToIpfs = async (file: File): Promise<string> => {
    try {
      console.log('Iniciando upload para Pinata...', file.name, file.size);
      const formData = new FormData();
      formData.append('file', file);

      const apiKey = import.meta.env.VITE_PINATA_API_KEY || '';
      const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY || '';
      
      console.log('API Key presente:', !!apiKey);
      console.log('Secret Key presente:', !!secretKey);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Resposta Pinata:', data);
      console.log('Status:', response.status);

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      if (!data.IpfsHash) {
        throw new Error('Nenhum hash retornado');
      }

      console.log('Hash obtido:', data.IpfsHash);
      return data.IpfsHash;
    } catch (error: any) {
      console.error('Erro Pinata completo:', error);
      throw new Error('Falha ao fazer upload da imagem: ' + error.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validações
      if (!title || !description || !category || !price || !imageFile) {
        throw new Error('Preencha todos os campos e selecione uma imagem');
      }

      // Upload imagem
      const imageIpfs = await uploadToIpfs(imageFile);

      // Criar post no contrato
      const signer = await getSigner();
      const marketplace = new Contract(
        CONTRACT_ADDRESSES.giroMarketplace,
        GIRO_MARKETPLACE_ABI,
        signer
      );

      const priceInWei = BigInt(price) * BigInt(10) ** BigInt(18);
      const tx = await marketplace.createPost(
        title,
        description,
        category,
        imageIpfs,
        priceInWei
      );
      await tx.wait();

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Arte');
      setPrice('');
      setImageFile(null);
      setImagePreview(null);
      
      onPostCreated();
      alert('Post criado com sucesso!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-4">
      <h2 className="text-2xl font-bold mb-6">Criar Post</h2>

      <form onSubmit={handleCreate} className="space-y-4">
        {/* Upload Imagem */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Foto *
          </label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="image-input"
              disabled={loading}
            />
            <label
              htmlFor="image-input"
              className="cursor-pointer block relative"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border-2 border-green-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <span className="text-white font-semibold">Trocar imagem</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition">
                  <svg
                    className="w-8 h-8 mx-auto mb-2 text-gray-400"
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
                  <p className="text-gray-600 font-semibold">Clique ou arraste uma imagem</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF até 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do seu produto..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descrição *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva seu produto..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            disabled={loading}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Categoria *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Preço */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Preço (GIRO) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.0"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !imageFile}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Criando...' : 'Criar Post'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
