import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || 'your-privy-app-id'}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        // `embeddedWallets` expects provider-specific keys (e.g. `ethereum`, `solana`).
        // Move `createOnLogin` under the provider you intend to use.
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
)
