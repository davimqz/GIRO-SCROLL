// Minimal shim for optional import used by @privy-io/react-auth during build.
// Provides a stubbed named export expected by the bundle.

export function getTransferSolInstruction() {
  throw new Error(
    'getTransferSolInstruction is not available. Install @solana/web3.js to enable Solana features.'
  );
}
