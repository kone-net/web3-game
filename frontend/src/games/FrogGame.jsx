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
  const [gameOverHandled, setGameOverHandled] = useState(false) // 防止重复调用游戏结束
  const [jumpSuccess, setJumpSuccess] = useState(false) // 成功跳跃的视觉反馈
  
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
    setGameOverHandled(false) // 重置游戏结束处理状态
    
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
  
  // 防止重复调用 onGameOver - 移到前面避免循环依赖
  const handleGameOver = useCallback((finalScore) => {
    if (gameOverHandled) return // 已经处理过，直接返回
    
    setIsGameOver(true)
    setGameOverHandled(true)
    onGameOver(finalScore)
  }, [gameOverHandled, onGameOver])
  
  // 跳跃函数 - 修复逻辑错误
  const jump = useCallback((direction) => {
    if (isJumping || isGameOver) return
    
    setIsJumping(true)
    
    // 计算跳跃目标位置
    const jumpDistance = 150
    let targetY = position.y
    let targetX = position.x
    
    if (direction === 'up') {
      targetY = position.y - jumpDistance
    } else if (direction === 'down') {
      targetY = position.y + jumpDistance
    } else if (direction === 'left') {
      targetX = position.x - jumpDistance
    } else if (direction === 'right') {
      targetX = position.x + jumpDistance
    }
    
    // 边界检查
    targetX = Math.max(0, Math.min(targetX, GAME_WIDTH - FROG_WIDTH))
    targetY = Math.max(50, Math.min(targetY, GAME_HEIGHT - FROG_HEIGHT - 50))
    
    // 检查是否到达对岸
    if (targetY <= 50) {
      const newScore = score + 500
      setScore(newScore)
      onScoreUpdate(newScore)
      
      // 更新最高分
      if (newScore > highScore) {
        setHighScore(newScore)
        localStorage.setItem('frog-game-high-score', newScore.toString())
      }
      
      // 延迟后重新开始游戏
      setTimeout(() => {
        initGame()
      }, 1000)
      setIsJumping(false)
      return
    }
    
    // 检查是否有荷叶 - 放宽碰撞检测范围
    const targetLilypad = lilypads.find(lilypad => {
      const frogCenterX = targetX + FROG_WIDTH / 2
      const frogCenterY = targetY + FROG_HEIGHT / 2
      const lilypadCenterX = lilypad.x + lilypad.width / 2
      const lilypadCenterY = lilypad.y + lilypad.height / 2
      
      // 放宽检测范围，让跳跃更容易成功
      return Math.abs(frogCenterX - lilypadCenterX) < LILY_PAD_WIDTH * 0.8 && 
             Math.abs(frogCenterY - lilypadCenterY) < LILY_PAD_HEIGHT * 0.8
    })
    
    if (!targetLilypad && targetY > 100) {
      // 跳跃失败，游戏结束
      setTimeout(() => {
        handleGameOver(score)
      }, 300)
      setIsJumping(false)
      return
    }
    
    // 执行跳跃动画
    const startY = position.y
    const startX = position.x
    const duration = 400 // 增加动画时长
    const startTime = Date.now()
    
    const jumpAnimation = () => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / duration, 1)
      
      // 更自然的跳跃轨迹（抛物线）
      const jumpHeight = 60 // 增加跳跃高度
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress // easeInOut
      const jumpProgress = -4 * jumpHeight * (easeProgress - 0.5) * (easeProgress - 0.5) + jumpHeight
      
      setPosition({
        x: startX + (targetX - startX) * easeProgress,
        y: startY - jumpProgress + (targetY - startY) * easeProgress
      })
      
      if (progress < 1) {
        requestAnimationFrame(jumpAnimation)
      } else {
        setIsJumping(false)
        
        // 显示成功跳跃的视觉反馈
        setJumpSuccess(true)
        setTimeout(() => setJumpSuccess(false), 200)
        
        // 更新分数
        const newScore = score + 10
        setScore(newScore)
        onScoreUpdate(newScore)
        
        // 更新最高分
        if (newScore > highScore) {
          setHighScore(newScore)
          localStorage.setItem('frog-game-high-score', newScore.toString())
        }
      }
    }
    
    jumpAnimation()
  }, [position, lilypads, isJumping, isGameOver, score, highScore, onScoreUpdate, onGameOver, initGame, gameOverHandled, handleGameOver])

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
  
  // 检查青蛙是否站在荷叶上 - 简化逻辑
  const checkFrogOnLilypad = useCallback(() => {
    if (isJumping || isGameOver || position.y <= 100) return true
    
    const frogCenterX = position.x + FROG_WIDTH / 2
    const frogBottom = position.y + FROG_HEIGHT
    
    const onLilypad = lilypads.some(lilypad => {
      const lilypadCenterX = lilypad.x + lilypad.width / 2
      const lilypadTop = lilypad.y
      
      // 放宽站立检测范围
      return Math.abs(frogCenterX - lilypadCenterX) < LILY_PAD_WIDTH * 0.8 && 
             Math.abs(frogBottom - lilypadTop) < 25
    })
    
    return onLilypad // 暂时不触发游戏结束，让玩家更容易游玩
  }, [position, lilypads, isJumping, isGameOver, score, onGameOver, gameOverHandled])
  
  // 游戏循环 - 修复依赖问题
  const gameLoop = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp
    
    if (!isGameOver) {
      updateLilypads(deltaTime)
      
      // 随着分数增加游戏速度
      if (score > 0 && score % 100 === 0) {
        setGameSpeed(prev => Math.min(prev + 0.1, 8))
      }
    }
    
    if (!isGameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
  }, [isGameOver, updateLilypads, score])
  
  // 键盘事件处理 - 防止页面滚动
  const handleKeyDown = useCallback((e) => {
    if (isGameOver) return
    
    // 防止方向键导致页面滚动
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
    }
    
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
  
  // 触控滑动处理 - 防止页面滚动
  const handleTouchStart = useCallback((e) => {
    // 防止触摸滑动导致页面滚动
    e.preventDefault()
    
    const touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
    
    const handleTouchMove = (e) => {
      e.preventDefault()
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
    
    document.addEventListener('touchend', handleTouchMove, { passive: false })
  }, [jump])
  
  // 渲染游戏
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    
    // 绘制背景（水面效果）
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT)
    gradient.addColorStop(0, '#87CEEB') // 天空蓝
    gradient.addColorStop(0.3, '#87CEEB')
    gradient.addColorStop(0.7, '#4682B4') // 深蓝色水面
    gradient.addColorStop(1, '#2F4F4F') // 深灰蓝色水底
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    
    // 添加水波纹效果
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      const y = 100 + i * 80
      for (let x = 0; x <= GAME_WIDTH; x += 20) {
        const waveY = y + Math.sin((x + Date.now() * 0.001) * 0.05) * 5
        if (x === 0) {
          ctx.moveTo(x, waveY)
        } else {
          ctx.lineTo(x, waveY)
        }
      }
      ctx.stroke()
    }
    
    // 绘制河岸（渐变效果）
    // 上岸
    const topGradient = ctx.createLinearGradient(0, 0, 0, 50)
    topGradient.addColorStop(0, '#228B22')
    topGradient.addColorStop(0.5, '#8B4513')
    topGradient.addColorStop(1, '#654321')
    ctx.fillStyle = topGradient
    ctx.fillRect(0, 0, GAME_WIDTH, 50)
    
    // 下岸
    const bottomGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 50, 0, GAME_HEIGHT)
    bottomGradient.addColorStop(0, '#654321')
    bottomGradient.addColorStop(0.5, '#8B4513')
    bottomGradient.addColorStop(1, '#228B22')
    ctx.fillStyle = bottomGradient
    ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50)
    
    // 添加一些草丛装饰
    ctx.fillStyle = '#32CD32'
    for (let i = 0; i < 20; i++) {
      const x = (i * 30) % GAME_WIDTH
      const y = i < 10 ? 35 : GAME_HEIGHT - 15
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 绘制荷叶
    lilypads.forEach(lilypad => {
      // 荷叶主体
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
      
      // 根据荷叶类型使用不同颜色
      const baseColor = lilypad.isStatic ? '#228B22' : '#32CD32'
      const gradient = ctx.createRadialGradient(
        lilypad.x + lilypad.width / 2, lilypad.y + lilypad.height / 2, 0,
        lilypad.x + lilypad.width / 2, lilypad.y + lilypad.height / 2, lilypad.width / 2
      )
      gradient.addColorStop(0, baseColor)
      gradient.addColorStop(1, lilypad.isStatic ? '#006400' : '#228B22')
      
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.strokeStyle = '#006400'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // 荷叶纹理（叶脉）
      ctx.strokeStyle = '#006400'
      ctx.lineWidth = 1
      ctx.beginPath()
      // 中间的主葉脉
      ctx.moveTo(lilypad.x + lilypad.width * 0.5, lilypad.y + lilypad.height * 0.2)
      ctx.lineTo(lilypad.x + lilypad.width * 0.5, lilypad.y + lilypad.height * 0.8)
      // 左右分叉
      ctx.moveTo(lilypad.x + lilypad.width * 0.3, lilypad.y + lilypad.height * 0.3)
      ctx.lineTo(lilypad.x + lilypad.width * 0.5, lilypad.y + lilypad.height * 0.5)
      ctx.moveTo(lilypad.x + lilypad.width * 0.7, lilypad.y + lilypad.height * 0.3)
      ctx.lineTo(lilypad.x + lilypad.width * 0.5, lilypad.y + lilypad.height * 0.5)
      ctx.stroke()
      
      // 移动荷叶的波纹效果
      if (!lilypad.isStatic) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(
          lilypad.x + lilypad.width / 2,
          lilypad.y + lilypad.height / 2,
          lilypad.width / 2 + 5,
          lilypad.height / 2 + 3,
          0,
          0,
          Math.PI * 2
        )
        ctx.stroke()
      }
    })
    
    // 绘制青蛙 - 改善外观，更可爱
    const frogCenterX = position.x + FROG_WIDTH / 2
    const frogCenterY = position.y + FROG_HEIGHT / 2
    
    // 根据跳跃状态调整青蛙大小（挤压效果）
    const scaleX = isJumping ? 1.1 : 1.0
    const scaleY = isJumping ? 0.9 : 1.0
    
    // 青蛙身体阴影（增加立体感）
    ctx.beginPath()
    ctx.ellipse(frogCenterX + 2, frogCenterY + 8, FROG_WIDTH * 0.4 * scaleX, FROG_HEIGHT * 0.35 * scaleY, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fill()
    
    // 青蛙身体（椭圆形）
    ctx.beginPath()
    ctx.ellipse(frogCenterX, frogCenterY + 5, FROG_WIDTH * 0.4 * scaleX, FROG_HEIGHT * 0.35 * scaleY, 0, 0, Math.PI * 2)
    const bodyGradient = ctx.createRadialGradient(
      frogCenterX - 10, frogCenterY, 0,
      frogCenterX, frogCenterY + 5, FROG_WIDTH * 0.4
    )
    bodyGradient.addColorStop(0, '#32CD32') // 亮绿色
    bodyGradient.addColorStop(1, '#228B22') // 深绿色
    ctx.fillStyle = bodyGradient
    ctx.fill()
    ctx.strokeStyle = '#006400'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // 青蛙头部（椭圆形）
    ctx.beginPath()
    ctx.ellipse(frogCenterX, frogCenterY - 8, FROG_WIDTH * 0.35 * scaleX, FROG_HEIGHT * 0.3 * scaleY, 0, 0, Math.PI * 2)
    const headGradient = ctx.createRadialGradient(
      frogCenterX - 8, frogCenterY - 12, 0,
      frogCenterX, frogCenterY - 8, FROG_WIDTH * 0.35
    )
    headGradient.addColorStop(0, '#7CFC00') // 最亮绿色
    headGradient.addColorStop(1, '#32CD32') // 亮绿色
    ctx.fillStyle = headGradient
    ctx.fill()
    ctx.strokeStyle = '#228B22'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // 青蛙脸颋（可爱的红色）
    ctx.fillStyle = 'rgba(255, 182, 193, 0.8)'
    ctx.beginPath()
    ctx.arc(position.x + FROG_WIDTH * 0.25, position.y + FROG_HEIGHT * 0.4, 6, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.75, position.y + FROG_HEIGHT * 0.4, 6, 0, Math.PI * 2)
    ctx.fill()
    
    // 青蛙眼睛（大一些，更可爱）
    // 眼球背景（白色）
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(position.x + FROG_WIDTH * 0.65, position.y + FROG_HEIGHT * 0.25, 12, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.35, position.y + FROG_HEIGHT * 0.25, 12, 0, Math.PI * 2)
    ctx.fill()
    
    // 眼球边框
    ctx.strokeStyle = '#006400'
    ctx.lineWidth = 1.5
    ctx.stroke()
    
    // 眼珠（根据跳跃状态变化）
    const eyeSize = isJumping ? 8 : 7
    ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(position.x + FROG_WIDTH * 0.68, position.y + FROG_HEIGHT * 0.25, eyeSize, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.32, position.y + FROG_HEIGHT * 0.25, eyeSize, 0, Math.PI * 2)
    ctx.fill()
    
    // 眼球高光（双层高光）
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(position.x + FROG_WIDTH * 0.7, position.y + FROG_HEIGHT * 0.23, 3, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.3, position.y + FROG_HEIGHT * 0.23, 3, 0, Math.PI * 2)
    ctx.fill()
    
    // 小高光
    ctx.beginPath()
    ctx.arc(position.x + FROG_WIDTH * 0.72, position.y + FROG_HEIGHT * 0.21, 1, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.28, position.y + FROG_HEIGHT * 0.21, 1, 0, Math.PI * 2)
    ctx.fill()
    
    // 青蛙嘴巴 - 更甜美的笑容
    ctx.beginPath()
    if (isJumping) {
      // 跳跃时显示兴奋的表情
      ctx.arc(position.x + FROG_WIDTH * 0.5, position.y + FROG_HEIGHT * 0.45, 10, 0.1 * Math.PI, 0.9 * Math.PI)
    } else {
      // 正常时显示温和的微笑
      ctx.arc(position.x + FROG_WIDTH * 0.5, position.y + FROG_HEIGHT * 0.45, 8, 0.2 * Math.PI, 0.8 * Math.PI)
    }
    ctx.strokeStyle = '#006400'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // 青蛙四肢（更细致）
    const limbGradient = ctx.createRadialGradient(
      frogCenterX, frogCenterY, 0,
      frogCenterX, frogCenterY, 15
    )
    limbGradient.addColorStop(0, '#32CD32')
    limbGradient.addColorStop(1, '#228B22')
    ctx.fillStyle = limbGradient
    
    ctx.beginPath()
    // 前腿（较小）
    ctx.arc(position.x + FROG_WIDTH * 0.2, position.y + FROG_HEIGHT * 0.7, 8, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.8, position.y + FROG_HEIGHT * 0.7, 8, 0, Math.PI * 2)
    // 后腿（较大，显示力量）
    ctx.arc(position.x + FROG_WIDTH * 0.15, position.y + FROG_HEIGHT * 0.9, 12, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.85, position.y + FROG_HEIGHT * 0.9, 12, 0, Math.PI * 2)
    ctx.fill()
    
    // 四肢边框
    ctx.strokeStyle = '#006400'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // 添加一些装饰性斑点（让青蛙更可爱）
    ctx.fillStyle = 'rgba(34, 139, 34, 0.6)'
    ctx.beginPath()
    ctx.arc(position.x + FROG_WIDTH * 0.3, position.y + FROG_HEIGHT * 0.6, 2, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.7, position.y + FROG_HEIGHT * 0.6, 2, 0, Math.PI * 2)
    ctx.arc(position.x + FROG_WIDTH * 0.5, position.y + FROG_HEIGHT * 0.8, 1.5, 0, Math.PI * 2)
    ctx.fill()
    
    // 添加成功跳跃的粒子效果
    if (jumpSuccess) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)'
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const radius = 20 + Math.sin(Date.now() * 0.02) * 5
        const sparkleX = frogCenterX + Math.cos(angle) * radius
        const sparkleY = frogCenterY + Math.sin(angle) * radius
        ctx.beginPath()
        ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // 中心发光效果
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.beginPath()
      ctx.arc(frogCenterX, frogCenterY, 15, 0, Math.PI * 2)
      ctx.fill()
    }
    
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
  }, [position, lilypads, isGameOver, score, jumpSuccess])
  
  // 组件挂载时初始化游戏
  useEffect(() => {
    initGame()
    
    // 启动游戏循环
    const startGameLoop = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    startGameLoop()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [initGame, gameLoop])
  
  // 添加键盘事件监听 - 防止页面滚动
  useEffect(() => {
    // 防止键盘导致页面滚动
    const preventDefaultForArrowKeys = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keydown', preventDefaultForArrowKeys)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', preventDefaultForArrowKeys)
    }
  }, [handleKeyDown])
  
  // 当游戏状态改变时重新渲染
  useEffect(() => {
    if (canvasRef.current) {
      renderGame()
    }
  }, [position, lilypads, isGameOver, score, renderGame, jumpSuccess])
  
  // 当父组件设置游戏结束时，更新子组件状态
  useEffect(() => {
    if (isParentGameOver && !isGameOver && !gameOverHandled) {
      setIsGameOver(true)
      setGameOverHandled(true)
      onGameOver(score)
    }
  }, [isParentGameOver, isGameOver, score, onGameOver, gameOverHandled])
  
  return (
    <div className="frog-game" onTouchStart={handleTouchStart} tabIndex={0} aria-label="青蛙荷塘跳游戏">
      <div className="frog-game-container">
        {/* 游戏头部 */}
        <div className="frog-game-header">
          <h1 className="frog-game-title">青蛙荷塘跳</h1>
          
          {/* 游戏控制 */}
          <div className="frog-game-controls">
            <div className="frog-game-scores">
              <div className="score-box score">
                <div className="score-label">分数</div>
                <div className="score-value">{score}</div>
              </div>
              <div className="score-box best">
                <div className="score-label">最高分</div>
                <div className="score-value">{highScore}</div>
              </div>
            </div>
            
            <div className="frog-game-actions">
              <button className="frog-game-new-game" onClick={initGame} aria-label="新游戏">
                新游戏
              </button>
            </div>
          </div>
        </div>
        
        {/* 游戏说明 */}
        <div className="frog-game-instructions">
          <p>使用方向键或滑动来控制青蛙跳跃。跳到对岸可以获得高分！注意不要掉进水里！</p>
        </div>
        
        {/* 游戏网格 */}
        <div className="frog-game-grid">
          <div className="frog-game-board-container">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="frog-game-canvas"
            />
            
            {/* 游戏结束覆盖层 */}
            {isGameOver && (
              <div className="game-over-overlay">
                <div className="game-over-message">游戏结束！</div>
                <div className="game-over-final-score">最终得分: {score}</div>
                <button 
                  className="frog-game-new-game" 
                  onClick={initGame}
                  aria-label="重新开始游戏"
                >
                  重新开始
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 移动设备控制按钮 */}
        <div className="frog-game-mobile-controls">
          <div className="control-button up" onClick={() => jump('up')} aria-label="向上跳">
            ↑
          </div>
          <div className="control-row">
            <div className="control-button left" onClick={() => jump('left')} aria-label="向左跳">
              ←
            </div>
            <div className="control-button down" onClick={() => jump('down')} aria-label="向下跳">
              ↓
            </div>
            <div className="control-button right" onClick={() => jump('right')} aria-label="向右跳">
              →
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FrogGame