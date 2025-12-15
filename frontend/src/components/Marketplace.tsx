import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { getProvider, getSigner } from '../web3';
import { CONTRACT_ADDRESSES, GIRO_TOKEN_ABI, GIRO_MARKETPLACE_ABI } from '../config';

interface Post {
  id: bigint;
  creator: string;
  ipfsHash: string;
  price: bigint;
  createdAt: bigint;
}

interface MarketplaceProps {
  userAddress: string;
  refreshTrigger: number;
}

export function Marketplace({ userAddress, refreshTrigger }: MarketplaceProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [buying, setBuying] = useState<number | null>(null);

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

        // Pegar próximo ID (última forma de iterar)
        const nextId = await marketplace.nextPostId();
        const postsList: Post[] = [];

        for (let i = 1; i < Number(nextId); i++) {
          const post = await marketplace.getPost(i);
          postsList.push({
            id: BigInt(i),
            creator: post.creator,
            ipfsHash: post.ipfsHash,
            price: post.price,
            createdAt: post.createdAt
          });
        }

        setPosts(postsList);
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
      // Recarregar dados
      window.location.reload();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setBuying(null);
    }
  };

  if (loading) return <p className="text-center">Carregando posts...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-lg font-semibold">
          Saldo: {(balance / BigInt(10) ** BigInt(18)).toString()} GIRO
        </p>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {posts.length === 0 ? (
        <p className="text-center text-gray-600">Nenhum post ainda</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div key={Number(post.id)} className="border rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600">
                De: {post.creator.slice(0, 6)}...{post.creator.slice(-4)}
              </p>
              <p className="font-mono text-xs text-gray-500 my-2">{post.ipfsHash}</p>
              <p className="text-xl font-bold mb-3">
                {(post.price / BigInt(10) ** BigInt(18)).toString()} GIRO
              </p>

              <button
                onClick={() => handleBuyPost(post.id, post.price)}
                disabled={
                  buying === Number(post.id) ||
                  post.creator.toLowerCase() === userAddress.toLowerCase() ||
                  balance < post.price
                }
                className="w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700 disabled:opacity-50"
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
          ))}
        </div>
      )}
    </div>
  );
}
