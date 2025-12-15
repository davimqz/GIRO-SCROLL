-- Check current user and onboarding status
-- Run this in Supabase SQL Editor

-- Users table
SELECT 
  id,
  wallet_address,
  name,
  email,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- Onboarding status
SELECT 
  os.id,
  os.user_id,
  os.step_wallet_connected,
  os.step_profile_completed,
  os.step_phone_verified,
  os.step_reward_claimed,
  os.completed_at
FROM onboarding_status os
JOIN users u ON os.user_id = u.id
ORDER BY os.created_at DESC
LIMIT 5;

-- Reward claims
SELECT 
  rc.id,
  rc.user_id,
  rc.wallet_address,
  rc.reward_type,
  rc.amount,
  rc.transaction_hash,
  rc.created_at
FROM reward_claims rc
ORDER BY rc.created_at DESC
LIMIT 5;
