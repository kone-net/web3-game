import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import './GamePage.css'

// 导入游戏组件
import Game2048 from '../games/Game2048'
import FrogGame from '../games/FrogGame'
import TankGame from '../games/TankGame'

// 导入游戏平台合约ABI
import { gamePlatformABI, contractAddress, GAME_TYPES } from '../App'

const GamePage = () => {
  const { gameType } = useParams()
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const [currentScore, setCurrentScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isSavingScore, setIsSavingScore] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [gameOverHandled, setGameOverHandled] = useState(false) // 防止重复处理游戏结束
  
  // 添加分数到区块链的hook
  const { writeContract, isPending: isAddScorePending, data: txHash } = useWriteContract()
  
  // 等待交易确认的Hook
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: txError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })
  
  // 游戏配置
  const gameConfig = GAME_TYPES[parseInt(gameType)]
  
  // 如果游戏类型不存在，重定向到首页
  useEffect(() => {
    if (!gameConfig) {
      navigate('/')
    }
  }, [gameConfig, navigate])
  
  // 处理交易确认状态
  useEffect(() => {
    if (isConfirming) {
      setIsSavingScore(true)
      setSaveStatus('正在保存分数到区块链...')
    } else if (isConfirmed) {
      setIsSavingScore(false)
      setSaveStatus('分数保存成功！')
      console.log('✅ 交易确认成功，分数已保存到区块链', {
        txHash,
        gameType,
        score: currentScore,
        timestamp: new Date().toISOString()
      })
      
      // 通知父组件数据已更新，可能需要刷新
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('blockchainDataUpdated', {
          detail: { gameType: parseInt(gameType), score: currentScore }
        }))
      }
      
      // 3秒后清空状态
      setTimeout(() => {
        setSaveStatus('')
      }, 3000)
    } else if (txError) {
      setIsSavingScore(false)
      setSaveStatus('保存失败，请重试')
      console.error('❌ 交易失败:', txError)
    }
  }, [isConfirming, isConfirmed, txError, txHash, gameType, currentScore])
  
  // 保存分数到区块链
  const saveScoreToBlockchain = (score) => {
    if (!isConnected) {
      setSaveStatus('请先连接钱包')
      return
    }
    
    if (isSavingScore) {
      console.log('正在保存中，忽略重复请求')
      return
    }
    console.log('保存分数到区块链 updateGameScore，分数:', score, ' gameType', gameType)
    
    try {
      setIsSavingScore(true)
      writeContract({
        address: contractAddress,
        abi: gamePlatformABI,
        functionName: 'updateGameScore',
        args: [parseInt(gameType), score]
      })
    } catch (error) {
      console.error('Error saving score:', error)
      setSaveStatus('保存失败，请重试')
      setIsSavingScore(false)
    }
  }
  
  // 处理游戏结束
  const handleGameOver = (finalScore) => {
    if (gameOverHandled) {
      console.log('游戏结束已处理，忽略重复调用')
      return
    }
    
    console.log('处理游戏结束，分数:', finalScore)
    setGameOverHandled(true)
    setIsGameOver(true)
    setCurrentScore(finalScore)
    
    // 自动保存分数到区块链
    if (isConnected && finalScore > 0) {
      saveScoreToBlockchain(finalScore)
    }
  }
  
  // 重新开始游戏
  const restartGame = () => {
    setIsGameOver(false)
    setCurrentScore(0)
    setSaveStatus('')
    setGameOverHandled(false) // 重置游戏结束处理标志
    setIsSavingScore(false)
  }
  
  // 返回个人主页
  const goToProfile = () => {
    navigate('/profile')
  }
  
  // 根据游戏类型渲染对应的游戏组件
  const renderGame = () => {
    switch (parseInt(gameType)) {
      case 0: // 2048
        return (
          <Game2048 
            onScoreUpdate={setCurrentScore}
            onGameOver={handleGameOver}
            isGameOver={isGameOver}
          />
        )
      case 1: // 青蛙荷塘跳
        return (
          <FrogGame 
            onScoreUpdate={setCurrentScore}
            onGameOver={handleGameOver}
            isGameOver={isGameOver}
          />
        )
      case 2: // 坦克大战
        return (
          <div className="tank-game-wrapper">
            <TankGame 
              gameId={parseInt(gameType)}
              onScoreUpdate={setCurrentScore}
              onGameOver={handleGameOver}
              isGameOver={isGameOver}
              onExit={() => navigate('/')}
            />
          </div>
        )
      default:
        return <div>游戏不存在</div>
    }
  }
  
  if (!gameConfig) {
    return null
  }
  
  return (
    <div className="game-page-container" style={{ borderColor: gameConfig.color }}>
      {/* 游戏头部 */}
      <header className="game-header">
        <div className="game-header-left">
          <button onClick={() => navigate('/')} className="home-button">
            🏠
          </button>
          <div className="game-title">
            <span className="game-icon">{gameConfig.icon}</span>
            <h1>{gameConfig.name}</h1>
          </div>
        </div>
        <div className="game-header-right">
          <div className="score-display">
            <span className="score-label">当前分数</span>
            <span className="score-value">{currentScore}</span>
          </div>
          {!isConnected && (
            <div className="wallet-prompt">
              连接钱包以保存分数
            </div>
          )}
        </div>
      </header>
      
      {/* 游戏内容区域 */}
      <main className="game-content">
        {renderGame()}
      </main>
      
      {/* 游戏状态和操作区域 */}
      <div className="game-footer">
        {saveStatus && (
          <div className={`save-status ${isSavingScore ? 'saving' : 'success'}`}>
            {saveStatus}
          </div>
        )}
        
        {isGameOver && (
          <div className="game-over-menu">
            <h2>游戏结束！</h2>
            <p>最终得分: {currentScore}</p>
                        {isConnected ? (
              <p>分数已自动保存到区块链</p>
            ) : (
              <button 
                className="save-score-button"
                onClick={() => saveScoreToBlockchain(currentScore)}
                disabled={isSavingScore}
              >
                {isSavingScore ? '保存中...' : '连接钱包并保存分数'}
              </button>
            )}
            <div className="game-actions">
              <button onClick={restartGame} className="restart-button">
                重新开始
              </button>
              <button onClick={goToProfile} className="profile-button">
                查看个人主页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GamePage