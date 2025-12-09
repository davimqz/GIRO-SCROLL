import { SystemProgram, PublicKey } from '@solana/web3.js'

export function getTransferSolInstruction(from: PublicKey | string, to: PublicKey | string, lamports: number) {
  const fromKey = typeof from === 'string' ? new PublicKey(from) : from
  const toKey = typeof to === 'string' ? new PublicKey(to) : to
  return SystemProgram.transfer({ fromPubkey: fromKey, toPubkey: toKey, lamports })
}

export default { getTransferSolInstruction }
