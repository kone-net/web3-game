import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'
import App from './App.jsx'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, goerli, localhost, hardhat } from 'wagmi/chains'
import { http } from 'wagmi'

// Create a React Query client
const queryClient = new QueryClient()

// Create RainbowKit config
const rainbowConfig = getDefaultConfig({
  appName: '票据收藏管理系统',
  projectId: '12345678901234567890123456789012', // 开发环境临时ID
  chains: [mainnet, goerli, localhost, hardhat],
  transports: {
    [mainnet.id]: http(),
    [goerli.id]: http(),
    [localhost.id]: http('http://localhost:8545'),
    [hardhat.id]: http('http://localhost:8545'),
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={rainbowConfig}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </StrictMode>,
)
