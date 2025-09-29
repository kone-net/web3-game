import { useState, useEffect } from 'react'
import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import './App.css'
import './HomePage.css' // 导入HomePage样式以使用深色模式按钮样式
import HomePage from './HomePage'

// 游戏平台合约ABI
export const gamePlatformABI =  [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum GamePlatform.GameType",
          "name": "gameType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "score",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isNewHighScore",
          "type": "bool"
        }
      ],
      "name": "GameScoreUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newLevel",
          "type": "uint256"
        }
      ],
      "name": "UserLevelUp",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "enum GamePlatform.GameType",
          "name": "gameType",
          "type": "uint8"
        }
      ],
      "name": "getPublicGameRecord",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "highScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "playCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "enum GamePlatform.GameType",
          "name": "gameType",
          "type": "uint8"
        }
      ],
      "name": "getUserGameRecord",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "highScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "playCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastPlayed",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserGames",
      "outputs": [
        {
          "internalType": "enum GamePlatform.GameType[]",
          "name": "",
          "type": "uint8[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalGamesPlayed",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "level",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum GamePlatform.GameType",
          "name": "gameType",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "score",
          "type": "uint256"
        }
      ],
      "name": "updateGameScore",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

// 合约地址 - Sepolia测试网
export const contractAddress = '0xc127E73B9016D838af9BBb353B4518Cced3B96D2'

// 游戏类型枚举映射
export const GAME_TYPES = {
  0: { id: 0, name: '2048', icon: '🎮', color: '#FF6B6B' },
  1: { id: 1, name: '青蛙荷塘跳', icon: '🐸', color: '#4ECDC4' },
  2: { id: 2, name: '坦克大战', icon: '🚀', color: '#FFA500' }
}

function UserGameProfile() {
  const navigate = useNavigate();
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    watch: true
  })
  const [lastTransactionHash, setLastTransactionHash] = useState('')
  const [dataRefreshTime, setDataRefreshTime] = useState(new Date())
  
  // 获取用户统计信息
  const { data: userStats, refetch: refetchUserStats, isLoading: isStatsLoading } = useReadContract({
    address: contractAddress,
    abi: gamePlatformABI,
    functionName: 'getUserStats',
    args: [address],
    enabled: isConnected,
    query: {
      refetchInterval: 30000, // 每10秒检查一次
      refetchOnWindowFocus: true,
      staleTime: 0,
      cacheTime: 1000 * 60 * 2,
    }
  })

  console.log('userStats:', userStats)
  
  // 获取用户已玩游戏列表
  const { 
    data: userGames, 
    refetch: refetchUserGames,
    isLoading: isGamesLoading 
  } = useReadContract({
    address: contractAddress,
    abi: gamePlatformABI,
    functionName: 'getUserGames',
    args: [address],
    enabled: isConnected,
    query: {
      refetchInterval: 10000, // 每10秒检查一次
      refetchOnWindowFocus: true,
      staleTime: 0,
      cacheTime: 1000 * 60 * 2,
    }
  })
  
  // 存储每个游戏的详细记录
  const [gameRecords, setGameRecords] = useState({})
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  
  // 从区块链获取游戏记录的hook工厂
  const useGameRecord = (gameType, enabled = false) => {
    return useReadContract({
      address: contractAddress,
      abi: gamePlatformABI,
      functionName: 'getUserGameRecord',
      args: [address, gameType],
      enabled: enabled && isConnected,
      // 添加更频繁的数据更新检查
      query: {
        refetchInterval: 5000, // 每5秒检查一次
        refetchOnWindowFocus: true, // 窗口获得焦点时刷新
        staleTime: 0, // 数据立即过期，鼓励重新获取
        cacheTime: 1000 * 60 * 2, // 缓存2分钟
      }
    })
  }

  
  // 为每个游戏类型创建hook
  const game0Record = useGameRecord(0, userGames?.includes(0))
  const game1Record = useGameRecord(1, userGames?.includes(1))
  const game2Record = useGameRecord(2, userGames?.includes(2))

  
  // 当用户连接或游戏列表变化时，获取每个游戏的详细记录
  useEffect(() => {
    if (isConnected && userGames && userGames.length > 0) {
      setIsLoadingRecords(true)
      const records = {}
      
      // 处理游戏0的记录
      if (userGames.includes(0) && game0Record.data) {
        records[0] = {
          highScore: Number(game0Record.data[0]),
          totalScore: Number(game0Record.data[1]),
          playCount: Number(game0Record.data[2]),
          lastPlayed: Number(game0Record.data[3]) * 1000 // 转换为毫秒
        }
      }
      
      // 处理游戏1的记录
      if (userGames.includes(1) && game1Record.data) {
        records[1] = {
          highScore: Number(game1Record.data[0]),
          totalScore: Number(game1Record.data[1]),
          playCount: Number(game1Record.data[2]),
          lastPlayed: Number(game1Record.data[3]) * 1000
        }
      }
      
      // 处理游戏2的记录
      if (userGames.includes(2) && game2Record.data) {
        records[2] = {
          highScore: Number(game2Record.data[0]),
          totalScore: Number(game2Record.data[1]),
          playCount: Number(game2Record.data[2]),
          lastPlayed: Number(game2Record.data[3]) * 1000
        }
      }
      
      setGameRecords(records)
      setIsLoadingRecords(false)
    }
  }, [isConnected, userGames, game0Record.data, game1Record.data, game2Record.data])
  
  // 刷新所有数据
  const refreshAllData = () => {
    console.log('🔄 手动刷新所有数据')
    setDataRefreshTime(new Date())
    refetchUserStats()
    refetchUserGames()
    // 刷新游戏记录
    if (userGames?.includes(0)) game0Record.refetch()
    if (userGames?.includes(1)) game1Record.refetch()
    if (userGames?.includes(2)) game2Record.refetch()
  }
  
  // 监听区块链数据更新事件
  useEffect(() => {
    const handleBlockchainDataUpdate = (event) => {
      console.log('🔔 收到区块链数据更新通知:', event.detail)
      // 延迟一小段时间后刷新，确保区块链数据已经同步
      setTimeout(() => {
        refreshAllData()
      }, 1000)
    }
    
    window.addEventListener('blockchainDataUpdated', handleBlockchainDataUpdate)
    
    return () => {
      window.removeEventListener('blockchainDataUpdated', handleBlockchainDataUpdate)
    }
  }, [userGames])
  
  // 跳转到游戏页面
  const navigateToGame = (gameType) => {
    navigate(`/game/${gameType}`)
  }
  
  // 格式化日期
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }
  
  return (
    <div className="game-profile-container">
      {/* 页面头部 */}
      <header className="profile-header">
        <div className="profile-header-left">
          <h1>游戏个人主页</h1>
          {userStats && (
            <div className="user-level">
              <span className="level-badge">等级 {userStats[2]}</span>
            </div>
          )}
        </div>
        <div className="profile-header-right">
          <button onClick={() => navigate('/')} className="back-button">
            返回首页
          </button>
          <div className="wallet-connection">
            <ConnectButton />
          </div>
        </div>
      </header>

      {!isConnected ? (
        <div className="connection-prompt">
          <h2>请连接钱包以查看您的游戏记录</h2>
          <p>连接钱包后，您可以查看游戏统计信息并开始游戏</p>
        </div>
      ) : (
        <div className="profile-content">
          {/* 用户统计卡片 */}
          <div className="stats-card">
            <h2>个人统计</h2>
            {isStatsLoading ? (
              <div className="loading">加载中...</div>
            ) : (
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{userStats ? userStats[1] : 0}</div>
                  <div className="stat-label">总积分</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{userStats ? userStats[0] : 0}</div>
                  <div className="stat-label">游戏次数</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{userStats ? userStats[2] : 1}</div>
                  <div className="stat-label">用户等级</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{userGames ? userGames.length : 0}</div>
                  <div className="stat-label">已玩游戏</div>
                </div>
              </div>
            )}
            <button onClick={refreshAllData} className="refresh-button">
              刷新数据
            </button>
            {/* <div className="debug-info" style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
              <div>最后刷新时间: {dataRefreshTime.toLocaleTimeString()}</div>
              <div>合约地址: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</div>
              <div>钱包地址: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '未连接'}</div>
              <div>当前网络: {chainId} {chainId === 11155111 ? '(Sepolia)' : chainId === 1 ? '(Mainnet)' : chainId === 5 ? '(Goerli)' : '(其他)'}</div>
              <div>数据加载状态: {isStatsLoading ? '加载中...' : '已完成'}</div>
              <div>用户统计: {userStats ? `游戏${userStats[0]}次, 积分${userStats[1]}, 等级${userStats[2]}` : '无数据'}</div>
            </div> */}
          </div>

          {/* 已玩游戏记录 */}
          <div className="game-records-section">
            <h2>已玩游戏记录</h2>
            {isGamesLoading || isLoadingRecords ? (
              <div className="loading">加载中...</div>
            ) : userGames && userGames.length > 0 ? (
              <div className="game-records-grid">
                {userGames.map(gameType => {
                  const gameInfo = GAME_TYPES[gameType]
                  const record = gameRecords[gameType]
                  return (
                    <div key={gameType} className="game-record-card" style={{ borderLeft: `4px solid ${gameInfo.color}` }}>
                      <div className="game-info">
                        <div className="game-icon">{gameInfo.icon}</div>
                        <div className="game-details">
                          <h3>{gameInfo.name}</h3>
                          <p>游玩次数: {record?.playCount || 0}</p>
                        </div>
                      </div>
                      <div className="game-scores">
                        <div className="score-item">
                          <span className="score-label">最高分</span>
                          <span className="score-value">{record?.highScore || 0}</span>
                        </div>
                        <div className="score-item">
                          <span className="score-label">总积分</span>
                          <span className="score-value">{record?.totalScore || 0}</span>
                        </div>
                      </div>
                      <button 
                        className="play-again-button"
                        onClick={() => navigateToGame(gameType)}
                      >
                        再次游玩
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="no-games">
                <p>您还没有游玩过任何游戏</p>
                <button onClick={() => navigate('/')} className="browse-games-button">
                  浏览游戏
                </button>
              </div>
            )}
          </div>

          {/* 所有可用游戏 */}
          <div className="all-games-section">
            <h2>所有游戏</h2>
            <div className="games-grid">
              {Object.values(GAME_TYPES).map(game => (
                <div 
                  key={game.id} 
                  className="game-card"
                  style={{ backgroundColor: `${game.color}10` }}
                >
                  <div className="game-card-icon" style={{ backgroundColor: game.color }}>
                    {game.icon}
                  </div>
                  <h3>{game.name}</h3>
                  <button 
                    className="play-button"
                    onClick={() => navigateToGame(game.id)}
                  >
                    开始游戏
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 页脚 */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="footer-logo">Web3 Game Platform</h3>
              <p className="footer-tagline">基于区块链的游戏平台</p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Twitter">
                  <span className="social-icon">🐦</span>
                </a>
                <a href="#" className="social-link" aria-label="Discord">
                  <span className="social-icon">💬</span>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <span className="social-icon">📂</span>
                </a>
              </div>
            </div>
            
            <div className="footer-links">
              <div className="footer-links-column">
                <h4 className="footer-links-title">快速链接</h4>
                <ul className="footer-links-list">
                  <li><a href="/" className="footer-link">首页</a></li>
                  <li><a href="/profile" className="footer-link">游戏记录</a></li>
                  {/* <li><a href="/faq" className="footer-link">常见问题</a></li> */}
                </ul>
              </div>
              
              <div className="footer-links-column">
                <h4 className="footer-links-title">联系我们</h4>
                <ul className="footer-links-list">
                  <li><a href="mailto:contact@web3game.com" className="footer-link">kone_net@163.com</a></li>
                  <li><a href="https://twitter.com/Web3GamePlatform" className="footer-link">@Web3GamePlatform</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">&copy; 2025 Web3 Game Platform. 保留所有权利.</p>
            <div className="footer-legal">
              <a href="/privacy" className="legal-link">隐私政策</a>
              <a href="/terms" className="legal-link">使用条款</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// 主应用组件，包含路由配置
// 导入游戏页面组件
import GamePage from './pages/GamePage'

// 全局深色模式管理
function GlobalDarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false)
  
  // 检测系统深色模式偏好并初始化
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
    if (prefersDark) {
      document.body.classList.add('dark')
    }
  }, [])
  
  // 切换深色模式
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.body.classList.toggle('dark')
  }
  
  return (
    <button 
      onClick={toggleDarkMode}
      className="dark-mode-toggle"
      aria-label={darkMode ? "切换到浅色模式" : "切换到深色模式"}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  )
}

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* 全局深色模式切换按钮 */}
        {/* <GlobalDarkModeToggle /> */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<UserGameProfile />} />
          <Route path="/game/:gameType" element={<GamePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
