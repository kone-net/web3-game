import React, { useState, useEffect, useCallback, useRef } from 'react'
import './FrogGame.css'

const FrogGame = ({ onScoreUpdate, onGameOver, isGameOver: isParentGameOver }) => {
  const [position, setPosition] = useState({ x: 100, y: 400 }) // 青蛙初始位置
  const [lilypads, setLilypads] = useState([]) // 荷叶数组
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameSpeed, setGameSpeed] = useState(3) // 游戏速度
  
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastTimeRef = useRef(0)
  
  // 游戏常量
  const GAME_WIDTH = 600
  const GAME_HEIGHT = 500
  const FROG_WIDTH = 60
  const FROG_HEIGHT = 60
  const LILY_PAD_WIDTH = 80
  const LILY_PAD_HEIGHT = 30
  const LILY_PAD_GAP = 120 // 荷叶间距
  
  // 初始化游戏
  const initGame = useCallback(() => {
    setPosition({ x: 100, y: 400 })
    setScore(0)
    setIsJumping(false)
    setIsGameOver(false)
    setGameSpeed(3)
    
    // 创建初始荷叶
    const initialLilypads = [
      { x: 100, y: 400, width: LILY_PAD_WIDTH, height: LILY_PAD_HEIGHT, isStatic: true },
      { x: 300, y: 350, width: LILY_PAD_WIDTH, height: LILY_PAD_HEIGHT, isStatic: false, direction: 1 },
      { x: 500, y: 300, width: LILY_PAD_WIDTH, height: LILY_PAD_HEIGHT, isStatic: false, direction: -1 },
      { x: 200, y: 250, width: LILY_PAD_WIDTH, height: LILY_PAD_HEIGHT, isStatic: false, direction: 1 },
      { x: 400, y: 200, width: LILY_PAD_WIDTH, height: LILY_PAD_HEIGHT, isStatic: false, direction: -1 },
      { x: 300, y: 150, width: LILY_PAD_WIDTH, height: LILY_PAD_HEIGHT, isStatic: false, direction: 1 },
      { x: 100, y: 100, width: LILY_PAD_WIDTH, height: LILY_PAD_HEIGHT, isStatic: false, direction: -1 }
    ]
    
    setLilypads(initialLilypads)
    
    // 从本地存储加载最高分
    const savedHighScore = localStorage.getItem('frog-game-high-score')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [])
  
  // 跳跃函数
  const jump = useCallback((direction) => {
    if (isJumping || isGameOver) return
    
    setIsJumping(true)
    
    // 计算跳跃目标位置
    const jumpDistance = 150
    let targetY
    let targetX = position.x
    
    if (direction === 'up') {
      targetY = position.y - jumpDistance
      // 找到可能的目标荷叶
      const targetLilypad = lilypads.find(lilypad => 
        Math.abs(lilypad.y - targetY) < 50 && 
        Math.abs((lilypad.x + lilypad.width/2) - (position.x + FROG_WIDTH/2)) < 50
      )
      
      if (targetLilypad) {
        targetY = targetLilypad.y - FROG_HEIGHT + 10
        // 如果荷叶不是静态的，设置青蛙跟随荷叶移动
        if (!targetLilypad.isStatic) {
          // 这里可以添加跟随逻辑
        }
      } else if (targetY < 50) {
        // 到达对岸
        targetY = 50
        const newScore = score + 500
        setScore(newScore)
        onScoreUpdate(newScore)
        
        // 延迟后重新开始游戏
        setTimeout(() => {
          initGame()
        }, 1000)
        return
      } else {
        // 跳跃失败，游戏结束
        setIsGameOver(true)
        onGameOver(score)
        return
      }
    } else if (direction === 'down') {
      targetY = position.y + jumpDistance
      
      const targetLilypad = lilypads.find(lilypad => 
        Math.abs(lilypad.y - targetY) < 50 && 
        Math.abs((lilypad.x + lilypad.width/2) - (position.x + FROG_WIDTH/2)) < 50
      )
      
      if (targetLilypad) {
        targetY = targetLilypad.y - FROG_HEIGHT + 10
      } else {
        // 跳跃失败，游戏结束
        setIsGameOver(true)
        onGameOver(score)
        return
      }
    } else if (direction === 'left') {
      targetX = position.x - jumpDistance
      targetY = position.y
      
      const targetLilypad = lilypads.find(lilypad => 
        Math.abs(lilypad.y - targetY) < 50 && 
        Math.abs((lilypad.x + lilypad.width/2) - (targetX + FROG_WIDTH/2)) < 50
      )
      
      if (targetLilypad) {
        targetY = targetLilypad.y - FROG_HEIGHT + 10
      } else {
        // 跳跃失败，游戏结束
        setIsGameOver(true)
        onGameOver(score)
        return
      }
    } else if (direction === 'right') {
      targetX = position.x + jumpDistance
      targetY = position.y
      
      const targetLilypad = lilypads.find(lilypad => 
        Math.abs(lilypad.y - targetY) < 50 && 
        Math.abs((lilypad.x + lilypad.width/2) - (targetX + FROG_WIDTH/2)) < 50
      )
      
      if (targetLilypad) {
        targetY = targetLilypad.y - FROG_HEIGHT + 10
      } else {
        // 跳跃失败，游戏结束
        setIsGameOver(true)
        onGameOver(score)
        return
      }
    }
    
    // 执行跳跃动画
    const startY = position.y
    const startX = position.x
    const currentScore = score
    const currentHighScore = highScore
    const duration = 300 // 跳跃持续时间
    const startTime = Date.now()
    
    const jumpAnimation = () => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / duration, 1)
      
      // 跳跃轨迹（抛物线）
      const jumpHeight = 50
      const jumpProgress = -4 * jumpHeight * (progress - 0.5) * (progress - 0.5) + jumpHeight
      
      setPosition({
        x: startX + (targetX - startX) * progress,
        y: startY - jumpProgress + (targetY - startY) * progress
      })
      
      if (progress < 1) {
        requestAnimationFrame(jumpAnimation)
      } else {
        setIsJumping(false)
        
        // 更新分数
        const newScore = currentScore + 10
        setScore(newScore)
        onScoreUpdate(newScore)
        
        // 更新最高分
        if (newScore > currentHighScore) {
          setHighScore(newScore)
          localStorage.setItem('frog-game-high-score', newScore.toString())
        }
      }
    }
    
    jumpAnimation()
  }, [targetX, targetY, onScoreUpdate])

  // 不再需要单独的useEffect来处理跳跃动画，因为我们直接在jump函数中调用animateJump
  
  // 更新移动的荷叶
  const updateLilypads = useCallback((deltaTime) => {
    setLilypads(prevLilypads => {
      return prevLilypads.map(lilypad => {
        if (lilypad.isStatic) return lilypad
        
        let newX = lilypad.x + (lilypad.direction * gameSpeed * deltaTime / 16)
        let newDirection = lilypad.direction
        
        // 边界检测
        if (newX < 0) {
          newX = 0
          newDirection = 1
        } else if (newX + lilypad.width > GAME_WIDTH) {
          newX = GAME_WIDTH - lilypad.width
          newDirection = -1
        }
        
        // 创建新对象而不是修改原对象
        return { ...lilypad, x: newX, direction: newDirection }
      })
    })
  }, [gameSpeed])
  
  // 检查青蛙是否站在荷叶上
  const checkFrogOnLilypad = useCallback(() => {
    const frogCenterX = position.x + FROG_WIDTH / 2
    const frogBottom = position.y + FROG_HEIGHT
    
    const onLilypad = lilypads.some(lilypad => {
      const lilypadCenterX = lilypad.x + lilypad.width / 2
      const lilypadTop = lilypad.y
      
      return Math.abs(frogCenterX - lilypadCenterX) < LILY_PAD_WIDTH / 2 && 
             Math.abs(frogBottom - lilypadTop) < 10
    })
    
    if (!onLilypad && !isJumping && position.y > 100) {
      setIsGameOver(true)
      onGameOver(score)
    }
  }, [position, lilypads, isJumping, score, onGameOver])
  
  // 游戏循环
  const gameLoop = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp
    
    if (!isGameOver) {
      updateLilypads(deltaTime)
      checkFrogOnLilypad()
      
      // 随着分数增加游戏速度
      if (score > 0 && score % 100 === 0) {
        setGameSpeed(prev => Math.min(prev + 0.1, 8))
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isGameOver, updateLilypads, checkFrogOnLilypad, score])
  
  // 键盘事件处理
  const handleKeyDown = useCallback((e) => {
    if (isGameOver) return
    
    switch (e.key) {
      case 'ArrowUp':
        jump('up')
        break
      case 'ArrowDown':
        jump('down')
        break
      case 'ArrowLeft':
        jump('left')
        break
      case 'ArrowRight':
        jump('right')
        break
    }
  }, [isGameOver, jump])
  
  // 触控滑动处理
  const handleTouchStart = useCallback((e) => {
    const touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
    
    const handleTouchMove = (e) => {
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      }
      
      const diffX = touchEnd.x - touchStart.x
      const diffY = touchEnd.y - touchStart.y
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (Math.abs(diffX) > 30) {
          diffX > 0 ? jump('right') : jump('left')
        }
      } else {
        // 垂直滑动
        if (Math.abs(diffY) > 30) {
          diffY > 0 ? jump('down') : jump('up')
        }
      }
      
      document.removeEventListener('touchend', handleTouchMove)
    }
    
    document.addEventListener('touchend', handleTouchMove)
  }, [jump])
  
  // 渲染游戏
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    
    // 绘制背景
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    
    // 绘制河岸
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(0, 0, GAME_WIDTH, 50)
    ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50)
    
    // 绘制荷叶
    lilypads.forEach(lilypad => {
      ctx.beginPath()
      ctx.ellipse(
        lilypad.x + lilypad.width / 2,
        lilypad.y + lilypad.height / 2,
        lilypad.width / 2,
        lilypad.height / 2,
        0,
        0,
        Math.PI * 2
      )
      ctx.fillStyle = lilypad.isStatic ? '#32CD32' : '#90EE90'
      ctx.fill()
      ctx.strokeStyle = '#228B22'
      ctx.lineWidth = 2
      ctx.stroke()
    })
    
    // 绘制青蛙
    ctx.fillStyle = '#32CD32'
    ctx.fillRect(position.x, position.y, FROG_WIDTH, FROG_HEIGHT)
    
    // 绘制青蛙眼睛
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(position.x + FROG_WIDTH * 0.7, position.y + FROG_HEIGHT * 0.3, 8, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.3, position.y + FROG_HEIGHT * 0.3, 8, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(position.x + FROG_WIDTH * 0.75, position.y + FROG_HEIGHT * 0.3, 4, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.35, position.y + FROG_HEIGHT * 0.3, 4, 0, Math.PI * 2)
    ctx.fill()
    
    // 绘制青蛙嘴巴
    ctx.beginPath()
    ctx.arc(position.x + FROG_WIDTH * 0.5, position.y + FROG_HEIGHT * 0.5, 10, 0, Math.PI)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // 绘制游戏结束遮罩
    if (isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
      
      ctx.fillStyle = 'white'
      ctx.font = '48px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('游戏结束', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50)
      
      ctx.font = '36px Arial'
      ctx.fillText(`分数: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2)
    }
  }, [position, lilypads, isGameOver, score])
  
  // 组件挂载时初始化游戏
  useEffect(() => {
    initGame()
    
    // 启动游戏循环
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [initGame, gameLoop])
  
  // 添加键盘事件监听
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
  
  // 当游戏状态改变时重新渲染
  useEffect(() => {
    renderGame()
  }, [renderGame])
  
  // 当父组件设置游戏结束时，更新子组件状态
  useEffect(() => {
    if (isParentGameOver && !isGameOver) {
      setIsGameOver(true)
      onGameOver(score)
    }
  }, [isParentGameOver, isGameOver, score, onGameOver])
  
  return (
    <div className="frog-game" onTouchStart={handleTouchStart}>
      <div className="frog-game-controls">
        <div className="frog-game-scores">
          <div className="score-box score">
            <div className="score-label">分数</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="score-box high">
            <div className="score-label">最高分</div>
            <div className="score-value">{highScore}</div>
          </div>
        </div>
        
        <button className="frog-game-new-game" onClick={initGame}>
          新游戏
        </button>
      </div>
      
      <div className="frog-game-canvas-container">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="frog-game-canvas"
        />
      </div>
      
      <div className="frog-game-instructions">
        <p>使用方向键或滑动来控制青蛙跳跃。跳到对岸可以获得高分！注意不要掉进水里！</p>
      </div>
      
      {/* 移动设备控制按钮 */}
      <div className="frog-game-mobile-controls">
        <div className="control-button up" onClick={() => jump('up')}>
          ↑
        </div>
        <div className="control-row">
          <div className="control-button left" onClick={() => jump('left')}>
            ←
          </div>
          <div className="control-button down" onClick={() => jump('down')}>
            ↓
          </div>
          <div className="control-button right" onClick={() => jump('right')}>
            →
          </div>
        </div>
      </div>
    </div>
  )
}

export default FrogGame