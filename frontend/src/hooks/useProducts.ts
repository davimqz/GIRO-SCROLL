import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '../lib/supabase';
import { parseEther } from 'viem';

export interface Product {
  id: string;
  seller_id: string;
  seller_wallet: string;
  title: string;
  description: string;
  price_giro: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  size?: string;
  category?: string;
  images: string[];
  status: 'active' | 'sold' | 'inactive' | 'deleted';
  views_count: number;
  created_at: string;
  updated_at: string;
  sold_at?: string;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number; // Preço em GIRO (ex: 10 GIRO)
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  size?: string;
  category?: string;
  images: File[]; // 2-4 imagens
}

export function useProducts() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const walletAddress = wallets[0]?.address?.toLowerCase();

  // Upload de imagens para Supabase Storage
  const uploadImages = useCallback(async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Gera nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${walletAddress}/${fileName}`;

      // Upload para o bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Pega a URL pública
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  }, [walletAddress]);

  // Criar produto
  const createProduct = useCallback(
    async (productData: CreateProductData): Promise<boolean> => {
      if (!authenticated || !walletAddress) {
        setError('Please connect your wallet');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Validações
        if (productData.images.length < 2 || productData.images.length > 4) {
          throw new Error('Please upload between 2 and 4 images');
        }

        if (productData.price <= 0) {
          throw new Error('Price must be greater than 0');
        }

        // Busca o usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', walletAddress)
          .single();

        if (userError || !userData) {
          throw new Error('User not found. Please complete onboarding first.');
        }

        // Upload das imagens
        console.log('Uploading images...');
        const imageUrls = await uploadImages(productData.images);

        // Converte preço para wei (18 decimals)
        const priceInWei = parseEther(productData.price.toString()).toString();

        // Cria o produto
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert({
            seller_id: userData.id,
            seller_wallet: walletAddress,
            title: productData.title,
            description: productData.description,
            price_giro: priceInWei,
            condition: productData.condition,
            size: productData.size || null,
            category: productData.category || null,
            images: imageUrls,
            status: 'active',
          })
          .select()
          .single();

        if (productError) {
          throw new Error(`Failed to create product: ${productError.message}`);
        }

        console.log('Product created successfully:', product);
        return true;
      } catch (err: any) {
        console.error('Error creating product:', err);
        setError(err.message || 'Failed to create product');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [authenticated, walletAddress, uploadImages]
  );

  // Listar produtos ativos
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listar meus produtos
  const fetchMyProducts = useCallback(async () => {
    if (!authenticated || !walletAddress) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userData.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching my products:', err);
      setError(err.message || 'Failed to fetch your products');
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, walletAddress]);

  return {
    // Estado
    isLoading,
    error,
    products,
    authenticated,
    walletAddress,

    // Ações
    createProduct,
    fetchProducts,
    fetchMyProducts,
    setError,
  };
}
