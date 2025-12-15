import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { getProvider } from '../web3';
import { CONTRACT_ADDRESSES, GIRO_MARKETPLACE_ABI } from '../config';

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

interface PurchasesProps {
  userAddress: string;
  refreshTrigger: number;
}

export function MyPurchases({ userAddress, refreshTrigger }: PurchasesProps) {
  const [purchases, setPurchases] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        setLoading(true);
        const provider = getProvider();
        const marketplace = new Contract(
          CONTRACT_ADDRESSES.giroMarketplace,
          GIRO_MARKETPLACE_ABI,
          provider
        );

        const purchaseIds = await marketplace.getUserPurchases(userAddress);
        const purchasesList: Post[] = [];

        for (const id of purchaseIds) {
          const post = await marketplace.getPost(id);
          purchasesList.push({
            id,
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

        setPurchases(purchasesList.reverse());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [userAddress, refreshTrigger]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="mt-4 text-gray-600">Carregando compras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {purchases.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600 mb-2">Você ainda não comprou nada</p>
          <p className="text-gray-500">Confira o Feed para encontrar posts interessantes</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Minhas Compras ({purchases.length})</h2>
          {purchases.map((post) => (
            <div
              key={Number(post.id)}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
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
                        Criador: {post.creator.slice(0, 6)}...{post.creator.slice(-4)}
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

                <p className="text-xs text-gray-500">
                  {new Date(Number(post.createdAt) * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
