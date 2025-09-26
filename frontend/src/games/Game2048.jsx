import React, { useState, useEffect, useCallback } from 'react'
import './Game2048.css'

const Game2048 = ({ onScoreUpdate, onGameOver, isGameOver: isParentGameOver }) => {
  const [grid, setGrid] = useState([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isGameWon, setIsGameWon] = useState(false)
  
  // 初始化游戏
  const initGame = useCallback(() => {
    const newGrid = Array(4).fill().map(() => Array(4).fill(0))
    addRandomTile(newGrid)
    addRandomTile(newGrid)
    setGrid(newGrid)
    setScore(0)
    setIsGameOver(false)
    setIsGameWon(false)
    
    // 从本地存储加载最高分
    const savedBestScore = localStorage.getItem('2048-best-score')
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore))
    }
  }, [])
  
  // 添加随机方块
  const addRandomTile = (grid) => {
    const emptyCells = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) {
          emptyCells.push({ row: i, col: j })
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      grid[row][col] = Math.random() < 0.9 ? 2 : 4
    }
    
    return grid
  }
  
  // 检查游戏是否结束
  const checkGameOver = (grid) => {
    // 检查是否有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) {
          return false
        }
      }
    }
    
    // 检查是否有可以合并的方块
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = grid[i][j]
        if (
          (i < 3 && current === grid[i + 1][j]) ||
          (j < 3 && current === grid[i][j + 1])
        ) {
          return false
        }
      }
    }
    
    return true
  }
  
  // 检查游戏是否胜利
  const checkGameWon = (grid) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 2048) {
          return true
        }
      }
    }
    return false
  }
  
  // 移动方块的通用逻辑
  const move = (direction) => {
    if (isGameOver) return false
    
    let moved = false
    let newScore = score
    let newGrid = grid.map(row => [...row])
    
    switch (direction) {
      case 'left':
        for (let i = 0; i < 4; i++) {
          const row = newGrid[i]
          const filtered = row.filter(cell => cell !== 0)
          let merged = []
          let j = 0
          
          while (j < filtered.length) {
            if (j < filtered.length - 1 && filtered[j] === filtered[j + 1]) {
              const mergedValue = filtered[j] * 2
              merged.push(mergedValue)
              newScore += mergedValue
              j += 2
            } else {
              merged.push(filtered[j])
              j += 1
            }
          }
          
          while (merged.length < 4) {
            merged.push(0)
          }
          
          if (!arraysEqual(row, merged)) {
            newGrid[i] = merged
            moved = true
          }
        }
        break
        
      case 'right':
        for (let i = 0; i < 4; i++) {
          const row = newGrid[i]
          const filtered = row.filter(cell => cell !== 0)
          let merged = []
          let j = filtered.length - 1
          
          while (j >= 0) {
            if (j > 0 && filtered[j] === filtered[j - 1]) {
              const mergedValue = filtered[j] * 2
              merged.unshift(mergedValue)
              newScore += mergedValue
              j -= 2
            } else {
              merged.unshift(filtered[j])
              j -= 1
            }
          }
          
          while (merged.length < 4) {
            merged.unshift(0)
          }
          
          if (!arraysEqual(row, merged)) {
            newGrid[i] = merged
            moved = true
          }
        }
        break
        
      case 'up':
        for (let j = 0; j < 4; j++) {
          const column = [newGrid[0][j], newGrid[1][j], newGrid[2][j], newGrid[3][j]]
          const filtered = column.filter(cell => cell !== 0)
          let merged = []
          let i = 0
          
          while (i < filtered.length) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
              const mergedValue = filtered[i] * 2
              merged.push(mergedValue)
              newScore += mergedValue
              i += 2
            } else {
              merged.push(filtered[i])
              i += 1
            }
          }
          
          while (merged.length < 4) {
            merged.push(0)
          }
          
          for (let i = 0; i < 4; i++) {
            newGrid[i][j] = merged[i]
          }
          
          if (!arraysEqual(column, merged)) {
            moved = true
          }
        }
        break
        
      case 'down':
        for (let j = 0; j < 4; j++) {
          const column = [newGrid[0][j], newGrid[1][j], newGrid[2][j], newGrid[3][j]]
          const filtered = column.filter(cell => cell !== 0)
          let merged = []
          let i = filtered.length - 1
          
          while (i >= 0) {
            if (i > 0 && filtered[i] === filtered[i - 1]) {
              const mergedValue = filtered[i] * 2
              merged.unshift(mergedValue)
              newScore += mergedValue
              i -= 2
            } else {
              merged.unshift(filtered[i])
              i -= 1
            }
          }
          
          while (merged.length < 4) {
            merged.unshift(0)
          }
          
          for (let i = 0; i < 4; i++) {
            newGrid[i][j] = merged[i]
          }
          
          if (!arraysEqual(column, merged)) {
            moved = true
          }
        }
        break
    }
    
    if (moved) {
      newGrid = addRandomTile(newGrid)
      setGrid(newGrid)
      setScore(newScore)
      
      // 更新最高分
      if (newScore > bestScore) {
        setBestScore(newScore)
        localStorage.setItem('2048-best-score', newScore.toString())
      }
      
      // 检查游戏胜利
      if (!isGameWon && checkGameWon(newGrid)) {
        setIsGameWon(true)
      }
      
      // 检查游戏结束
      if (checkGameOver(newGrid)) {
        setIsGameOver(true)
        onGameOver(newScore)
      }
      
      // 更新父组件分数
      onScoreUpdate(newScore)
    }
    
    return moved
  }
  
  // 检查两个数组是否相等
  const arraysEqual = (a, b) => {
    return a.length === b.length && a.every((val, index) => val === b[index])
  }
  
  // 键盘事件处理
  const handleKeyDown = useCallback((e) => {
    if (isGameOver) return
    
    switch (e.key) {
      case 'ArrowLeft':
        move('left')
        break
      case 'ArrowRight':
        move('right')
        break
      case 'ArrowUp':
        move('up')
        break
      case 'ArrowDown':
        move('down')
        break
    }
  }, [grid, score, isGameOver])
  
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
        if (Math.abs(diffX) > 20) {
          diffX > 0 ? move('right') : move('left')
        }
      } else {
        // 垂直滑动
        if (Math.abs(diffY) > 20) {
          diffY > 0 ? move('down') : move('up')
        }
      }
      
      document.removeEventListener('touchend', handleTouchMove)
    }
    
    document.addEventListener('touchend', handleTouchMove)
  }, [grid, score, isGameOver])
  
  // 组件挂载时初始化游戏
  useEffect(() => {
    initGame()
  }, [initGame])
  
  // 添加键盘事件监听
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
  
  // 当父组件设置游戏结束时，更新子组件状态
  useEffect(() => {
    if (isParentGameOver && !isGameOver) {
      setIsGameOver(true)
    }
  }, [isParentGameOver, isGameOver])
  
  // 获取方块的CSS类名
  const getTileClassName = (value) => {
    if (value === 0) return 'tile tile-empty'
    return `tile tile-${value}`
  }
  
  // 获取方块的值
  const getTileValue = (value) => {
    return value === 0 ? '' : value
  }
  
  // 获取方块的位置样式 - 修复位置计算以确保完整显示
  const getTileStyle = (row, col) => {
    // 使用百分比定位，确保在任何尺寸的容器中都正确显示
    const offset = 2; // 格子间距百分比
    const size = (100 - (offset * 5)) / 4; // 每个格子的大小
    
    return {
      left: `${col * (size + offset)}%`,
      top: `${row * (size + offset)}%`,
      width: `${size}%`,
      height: `${size}%`,
      position: 'absolute',
      transition: 'transform 0.15s ease, opacity 0.15s ease'
    }
  }
  
  return (
    <div className="game-2048" onTouchStart={handleTouchStart} tabIndex={0} aria-label="2048游戏">

      <div className="game-2048-container">
        {/* 游戏头部 */}
        <div className="game-2048-header">
          <h1 className="game-2048-title">2048</h1>
          
          {/* 游戏控制 */}
          <div className="game-2048-controls">
            <div className="game-2048-scores">
              <div className="score-box score">
                <div className="score-label">分数</div>
                <div className="score-value">{score}</div>
              </div>
              <div className="score-box best">
                <div className="score-label">最高分</div>
                <div className="score-value">{bestScore}</div>
              </div>
            </div>
            
            <div className="game-2048-actions">
              <button className="game-2048-new-game" onClick={initGame} aria-label="新游戏">
                新游戏
              </button>
            </div>
          </div>
        </div>
        {/* 游戏说明 */}
        <div className="game-2048-instructions">
          <p>使用方向键或滑动来移动方块。相同数字的方块相撞时会合并为它们的总和！尝试获得2048方块！</p>
        </div>
        
        {/* 游戏网格 - 关键修复：确保游戏完整显示 */}
        <div className="game-2048-grid">
          <div className="game-2048-board-container">
            <div className="game-2048-board">
            {/* 渲染空格子背景 */}
            {Array(4).fill(null).map((_, rowIndex) => 
              Array(4).fill(null).map((_, colIndex) => (
                <div 
                  key={`bg-${rowIndex}-${colIndex}`}
                  className="grid-cell"
                />
              ))
            )}
            
            {/* 渲染方块 */}
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getTileClassName(cell)}
                  style={getTileStyle(rowIndex, colIndex)}
                  role="button"
                  aria-label={`数字${cell}方块`}
                >
                  <div className="tile-inner">
                    {getTileValue(cell)}
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        {/* 游戏胜利覆盖层 */}
        {isGameWon && !isGameOver && (
          <div className="game-over-overlay">
            <div className="game-over-message">恭喜你赢了！</div>
            <div className="game-over-final-score">当前得分: {score}</div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button 
                className="game-2048-new-game continue-btn" 
                onClick={() => setGameWon(false)}
                aria-label="继续游戏"
              >
                继续游戏
              </button>
              <button className="game-2048-new-game" onClick={initGame} aria-label="新游戏">
                新游戏
              </button>
            </div>
          </div>
        )}
        
        {/* 游戏结束覆盖层 */}
        {isGameOver && (
          <div className="game-over-overlay">
            <div className="game-over-message">游戏结束！</div>
            <div className="game-over-final-score">最终得分: {score}</div>
            <button 
              className="game-2048-new-game" 
              onClick={initGame}
              aria-label="重新开始游戏"
            >
              重新开始
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default Game2048