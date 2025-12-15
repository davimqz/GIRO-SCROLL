import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { getProvider, getSigner } from '../web3';
import { CONTRACT_ADDRESSES, GIRO_TOKEN_ABI, GIRO_MARKETPLACE_ABI } from '../config';

interface Post {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  category: string;
  imageIpfs: string;
  price: bigint;
  createdAt: bigint;
  sold: boolean;
}

interface FeedProps {
  userAddress: string;
  refreshTrigger: number;
}

export function Feed({ userAddress, refreshTrigger }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [buying, setBuying] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Carregar posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const provider = getProvider();
        const marketplace = new Contract(
          CONTRACT_ADDRESSES.giroMarketplace,
          GIRO_MARKETPLACE_ABI,
          provider
        );

        const nextId = await marketplace.nextPostId();
        const postsList: Post[] = [];

        for (let i = 1; i < Number(nextId); i++) {
          const post = await marketplace.getPost(i);
          // Filtrar apenas posts não vendidos
          if (!post.sold) {
            postsList.push({
              id: BigInt(i),
              creator: post.creator,
              title: post.title,
              description: post.description,
              category: post.category,
              imageIpfs: post.imageIpfs,
              price: post.price,
              createdAt: post.createdAt,
              sold: post.sold
            });
          }
        }

        setPosts(postsList.reverse()); // Mais recentes primeiro
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [refreshTrigger]);

  // Carregar saldo
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const provider = getProvider();
        const token = new Contract(
          CONTRACT_ADDRESSES.giroToken,
          GIRO_TOKEN_ABI,
          provider
        );
        const bal = await token.balanceOf(userAddress);
        setBalance(bal);
      } catch (err) {
        console.error('Erro ao carregar saldo:', err);
      }
    };

    loadBalance();
  }, [userAddress, refreshTrigger]);

  const handleBuyPost = async (postId: bigint, price: bigint) => {
    try {
      setBuying(Number(postId));
      const signer = await getSigner();

      // 1. Aprovar tokens
      const token = new Contract(
        CONTRACT_ADDRESSES.giroToken,
        GIRO_TOKEN_ABI,
        signer
      );

      const approveTx = await token.approve(
        CONTRACT_ADDRESSES.giroMarketplace,
        price
      );
      await approveTx.wait();

      // 2. Comprar post
      const marketplace = new Contract(
        CONTRACT_ADDRESSES.giroMarketplace,
        GIRO_MARKETPLACE_ABI,
        signer
      );

      const buyTx = await marketplace.buyPost(postId);
      await buyTx.wait();

      alert('Post comprado com sucesso!');
      window.location.reload();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Saldo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">Seu saldo</p>
        <p className="text-3xl font-bold text-blue-600">
          {(balance / BigInt(10) ** BigInt(18)).toString()} GIRO
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600 mb-2">Nenhum post ainda</p>
          <p className="text-gray-500">Seja o primeiro a criar um post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={Number(post.id)}
              onClick={() => setSelectedPost(post)}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
            >
              {/* Imagem */}
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                {post.imageIpfs ? (
                  <img
                    src={`https://ipfs.io/ipfs/${post.imageIpfs}`}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Imagem carregada:', post.imageIpfs)}
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', post.imageIpfs);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                {!post.imageIpfs && (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <p className="text-xs text-gray-500">
                        {post.creator.slice(0, 6)}...{post.creator.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {(post.price / BigInt(10) ** BigInt(18)).toString()}
                    </p>
                    <p className="text-xs text-gray-500">GIRO</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {post.description}
                </p>

                <p className="text-xs text-gray-500 mb-4">
                  {new Date(Number(post.createdAt) * 1000).toLocaleDateString()}
                </p>

                <button
                  onClick={() => handleBuyPost(post.id, post.price)}
                  disabled={
                    buying === Number(post.id) ||
                    post.creator.toLowerCase() === userAddress.toLowerCase() ||
                    balance < post.price
                  }
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    post.creator.toLowerCase() === userAddress.toLowerCase()
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : balance < post.price
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : buying === Number(post.id)
                      ? 'bg-gray-400 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {buying === Number(post.id)
                    ? 'Comprando...'
                    : post.creator.toLowerCase() === userAddress.toLowerCase()
                    ? 'Seu post'
                    : balance < post.price
                    ? 'Saldo insuficiente'
                    : 'Comprar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between p-4">
              <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
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

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Imagem Grande */}
              <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                {selectedPost.imageIpfs ? (
                  <img
                    src={`https://ipfs.io/ipfs/${selectedPost.imageIpfs}`}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>

              {/* Informações */}
              <div className="space-y-4">
                {/* Categoria e Preço */}
                <div className="flex items-center justify-between">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
                    {selectedPost.category}
                  </span>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      {(selectedPost.price / BigInt(10) ** BigInt(18)).toString()}
                    </p>
                    <p className="text-sm text-gray-500">GIRO</p>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.description}</p>
                </div>

                {/* Criador e Data */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Criador:</span>
                    <span className="font-mono text-sm text-gray-900">
                      {selectedPost.creator.slice(0, 6)}...{selectedPost.creator.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="text-gray-900">
                      {new Date(Number(selectedPost.createdAt) * 1000).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Botão de Compra */}
                {selectedPost.sold ? (
                  <div className="bg-gray-50 border border-gray-200 text-gray-600 py-3 rounded-lg text-center font-semibold">
                    Já foi vendido
                  </div>
                ) : userAddress !== selectedPost.creator ? (
                  <button
                    onClick={() => {
                      // Aqui você pode chamar a função de compra
                      console.log('Comprar post', Number(selectedPost.id));
                    }}
                    disabled={buying === Number(selectedPost.id) || balance < selectedPost.price}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {buying === Number(selectedPost.id) ? 'Comprando...' : 'Comprar'}
                  </button>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 text-gray-600 py-3 rounded-lg text-center font-semibold">
                    Este é seu post
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
