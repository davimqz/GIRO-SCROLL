import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Provide an alias for an optional Solana peer dependency that some bundles
// reference. When `@solana-program/system` isn't installed, Rollup/Vite will
// fail resolving named exports; alias it to a local shim that supplies the
// necessary symbols at build time.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@solana-program/system': path.resolve(__dirname, 'src/shims/solana-system.ts'),
    },
  },
})
