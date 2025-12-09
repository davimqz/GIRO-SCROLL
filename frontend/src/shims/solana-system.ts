// Minimal shim for optional import used by @privy-io/react-auth during build.
// This provides a named export `getTransferSolInstruction` so bundlers don't fail
// when the optional peer dependency `@solana-program/system` is not installed.
//
// Note: This is a build-time shim. If your app actually needs to transfer SOL
// at runtime, install `@solana/web3.js` and replace this shim with a proper
// implementation that returns a TransactionInstruction.

export function getTransferSolInstruction() {
  throw new Error(
    'getTransferSolInstruction is not available. Install @solana/web3.js to enable Solana features.'
  );
}
