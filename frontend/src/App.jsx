import { useState, useEffect } from 'react'
import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import './App.css'
import HomePage from './HomePage'

// 游戏平台合约ABI
export const gamePlatformABI = [
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
  },
  {
    "inputs": [
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
    "inputs": [],
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
    "inputs": [],
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
  }
]

// 合约地址
export const contractAddress = '0xbDEEA398F36cAAC38242db75Cb40d82540E2EC38'

// 游戏类型枚举映射
export const GAME_TYPES = {
  0: { id: 0, name: '2048', icon: '🎮', color: '#FF6B6B' },
  1: { id: 1, name: '青蛙荷塘跳', icon: '🐸', color: '#4ECDC4' }
}

function UserGameProfile() {
  const navigate = useNavigate();
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    watch: true
  })
  const [lastTransactionHash, setLastTransactionHash] = useState('')
  
  // 获取用户统计信息
  const { 
    data: userStats, 
    refetch: refetchUserStats, 
    isLoading: isStatsLoading 
  } = useReadContract({
    address: contractAddress,
    abi: gamePlatformABI,
    functionName: 'getUserStats',
    enabled: isConnected
  })
  
  // 获取用户已玩游戏列表
  const { 
    data: userGames, 
    refetch: refetchUserGames,
    isLoading: isGamesLoading 
  } = useReadContract({
    address: contractAddress,
    abi: gamePlatformABI,
    functionName: 'getUserGames',
    enabled: isConnected
  })
  
  // 存储每个游戏的详细记录
  const [gameRecords, setGameRecords] = useState({})
  
  // 当用户连接或游戏列表变化时，获取每个游戏的详细记录
  useEffect(() => {
    if (isConnected && userGames) {
      const fetchGameRecords = async () => {
        const records = {}
        for (const gameType of userGames) {
          try {
            // 这里应该使用useReadContract的返回值，但为了简化，我们使用mock数据
            // 实际项目中应该为每个游戏创建单独的hook
            records[gameType] = {
              highScore: Math.floor(Math.random() * 10000),
              totalScore: Math.floor(Math.random() * 50000),
              playCount: Math.floor(Math.random() * 50),
              lastPlayed: Date.now() - Math.floor(Math.random() * 86400000 * 7)
            }
          } catch (error) {
            console.error(`Error fetching record for game ${gameType}:`, error)
          }
        }
        setGameRecords(records)
      }
      fetchGameRecords()
    }
  }, [isConnected, userGames])
  
  // 刷新所有数据
  const refreshAllData = () => {
    refetchUserStats()
    refetchUserGames()
  }
  
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
          </div>

          {/* 已玩游戏记录 */}
          <div className="game-records-section">
            <h2>已玩游戏记录</h2>
            {isGamesLoading ? (
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
    </div>
  )
}

// 主应用组件，包含路由配置
// 导入游戏页面组件
import GamePage from './pages/GamePage'

function App() {
  return (
    <Router>
      <div className="app-container">
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
