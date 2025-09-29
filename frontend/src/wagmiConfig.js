import { createConfig, http } from 'wagmi'
import { mainnet, goerli, localhost, hardhat, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

// 创建Wagmi配置
const config = createConfig({
  chains: [
    mainnet,  // 以太坊主网
    goerli,   // Goerli测试网
    sepolia,  // Sepolia测试网
    localhost, // 本地开发网络（如Ganache）
    hardhat   // Hardhat开发网络
  ],
  connectors: [
    // MetaMask和其他浏览器钱包
    injected(),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'Web3游戏平台',
      jsonRpcUrl: 'http://localhost:8545', // Ganache默认地址
    }),
    // WalletConnect - 对于开发环境使用简单配置
    walletConnect({
      projectId: '12345678901234567890123456789012', // 开发环境临时ID
      metadata: {
        name: 'Web3游戏平台',
        description: '基于区块链技术的Web3游戏平台',
        url: 'http://localhost:5173',
        icons: ['http://localhost:5173/vite.svg'],
      },
    }),
  ],
  transports: {
    // 为每个链配置HTTP传输
    [mainnet.id]: http(),
    [goerli.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http('http://localhost:8545'), // Ganache默认地址
    [hardhat.id]: http('http://localhost:8545'),
  },
  ssr: false, // 禁用服务器端渲染
})

export default config