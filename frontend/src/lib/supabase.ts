import { createClient } from '@supabase/supabase-js';

// Pega as credenciais do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface User {
  id: string;
  wallet_address: string;
  email?: string;
  name?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStatus {
  id: string;
  user_id: string;
  wallet_address: string;
  step_wallet_connected: boolean;
  step_profile_completed: boolean;
  step_phone_verified: boolean;
  step_reward_claimed: boolean;
  reward_transaction_hash?: string;
  reward_claimed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RewardClaim {
  id: string;
  user_id: string;
  wallet_address: string;
  reward_type: string;
  amount: string;
  transaction_hash: string;
  block_number?: number;
  claimed_at: string;
}
