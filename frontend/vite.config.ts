import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Shim for optional peer-dep used by @privy-io/react-auth
      '@solana-program/system': path.resolve(__dirname, 'src/shims/solana-system.ts'),
    },
  },
})
