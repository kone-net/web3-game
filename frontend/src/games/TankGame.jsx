import React, { useState, useEffect, useRef } from 'react';

// 游戏常量
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TANK_SIZE = 40;
const BULLET_SIZE = 8;
const TANK_SPEED = 3; // 降低坦克速度
const BULLET_SPEED = 6; // 降低子弹速度
const ENEMY_SPAWN_RATE = 180; // 降低敌人生成频率

const TankGame = ({ gameId, onScoreUpdate, onGameOver, isGameOver: parentGameOver, onExit }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0); // 使用ref保存最新分数值
  console.log('TankGame组件初始化，初始分数:', score);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOverHandled, setGameOverHandled] = useState(false); // 防止重复处理
  const [paused, setPaused] = useState(false); // 游戏暂停状态
  
  // 游戏状态
  const gameState = useRef({
    player: {
      x: CANVAS_WIDTH / 2 - TANK_SIZE / 2,
      y: CANVAS_HEIGHT - TANK_SIZE - 20,
      direction: 'up',
      bullets: [],
      cooldown: 0
    },
    enemies: [],
    keys: {},
    frameCount: 0
  });

  // 更新分数并通知父组件
  const updateScore = (points) => {
    console.log('updateScore调用，增加分数:', points);
    setScore(prevScore => {
      const newScore = prevScore + points;
      scoreRef.current = newScore; // 更新ref中的最新分数
      console.log('updateScore更新后总分:', newScore);
      if (onScoreUpdate) {
        onScoreUpdate(newScore);
      }
      return newScore;
    });
  };
  
  // 处理游戏结束
  const handleGameOver = () => {
    if (gameOverHandled) return;
    
    setGameOverHandled(true);
    setGameOver(true);
    
    // 游戏结束时，让父组件(GamePage)处理分数保存到区块链
    const finalScore = scoreRef.current; // 使用ref中的最新分数
    console.log('TankGame游戏结束，最终分数:', finalScore);
    if (onGameOver) {
      console.log('坦克游戏结束，调用onGameOver保存分数:', finalScore);
      onGameOver(finalScore);
    }
  };

  // 初始化游戏
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 确保canvas尺寸正确
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // 键盘事件监听
    const handleKeyDown = (e) => {
      // 阻止方向键和空格的默认行为（页面滚动）
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'p'].includes(e.key)) {
        e.preventDefault();
      }
      
      // 处理暂停键
      if (e.key === 'p' && gameStarted && !gameOver) {
        setPaused(prev => !prev);
        return;
      }
      
      gameState.current.keys[e.key] = true;
      
      // 空格键发射子弹
      if (e.key === ' ' && gameState.current.player.cooldown === 0 && !paused) {
        let bulletX, bulletY;
        const direction = gameState.current.player.direction;
        const player = gameState.current.player;
        
        // 根据方向从炮管位置发射子弹
        switch (direction) {
          case 'up':
            bulletX = player.x + TANK_SIZE / 2 - BULLET_SIZE / 2;
            bulletY = player.y - BULLET_SIZE;
            break;
          case 'down':
            bulletX = player.x + TANK_SIZE / 2 - BULLET_SIZE / 2;
            bulletY = player.y + TANK_SIZE;
            break;
          case 'left':
            bulletX = player.x - BULLET_SIZE;
            bulletY = player.y + TANK_SIZE / 2 - BULLET_SIZE / 2;
            break;
          case 'right':
            bulletX = player.x + TANK_SIZE;
            bulletY = player.y + TANK_SIZE / 2 - BULLET_SIZE / 2;
            break;
          default:
            // 默认从中心发射
            bulletX = player.x + TANK_SIZE / 2 - BULLET_SIZE / 2;
            bulletY = player.y + TANK_SIZE / 2 - BULLET_SIZE / 2;
        }
        
        const bullet = {
          x: bulletX,
          y: bulletY,
          direction: direction
        };
        console.log('发射子弹:', bullet);
        gameState.current.player.bullets.push(bullet);
        gameState.current.player.cooldown = 20;
      }
    };
    
    const handleKeyUp = (e) => {
      // 阻止方向键的默认行为（页面滚动）
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      gameState.current.keys[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // 游戏循环
    let animationFrameId;
    const gameLoop = () => {
      // 只有在游戏未暂停时才更新游戏状态
      if (!paused) {
        updateGame();
      }
      // 无论是否暂停都绘制游戏
      drawGame(ctx);
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    if (gameStarted && !gameOver) {
      gameLoop();
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameStarted, gameOver, paused]);

  // 更新游戏状态
  const updateGame = () => {
    const state = gameState.current;
    // 只在游戏未暂停时增加帧数
    if (!paused) {
      state.frameCount++;
    }
    
    // 移动玩家坦克（仅在游戏未暂停时）
    if (!paused) {
      if (state.keys.ArrowUp) {
        state.player.y = Math.max(0, state.player.y - TANK_SPEED);
        state.player.direction = 'up';
      }
      if (state.keys.ArrowDown) {
        state.player.y = Math.min(CANVAS_HEIGHT - TANK_SIZE, state.player.y + TANK_SPEED);
        state.player.direction = 'down';
      }
      if (state.keys.ArrowLeft) {
        state.player.x = Math.max(0, state.player.x - TANK_SPEED);
        state.player.direction = 'left';
      }
      if (state.keys.ArrowRight) {
        state.player.x = Math.min(CANVAS_WIDTH - TANK_SIZE, state.player.x + TANK_SPEED);
        state.player.direction = 'right';
      }
    }
    
    // 冷却时间（仅在游戏未暂停时减少）
    if (!paused && state.player.cooldown > 0) {
      state.player.cooldown--;
    }
    
    // 移动子弹（仅在游戏未暂停时执行）
    if (!paused) {
      state.player.bullets = state.player.bullets.filter(bullet => {
        // 根据方向更新子弹位置
        switch (bullet.direction) {
          case 'up':
            bullet.y -= BULLET_SPEED;
            break;
          case 'down':
            bullet.y += BULLET_SPEED;
            break;
          case 'left':
            bullet.x -= BULLET_SPEED;
            break;
          case 'right':
            bullet.x += BULLET_SPEED;
            break;
        }
        
        // 检查子弹是否击中敌人
        const hitIndex = state.enemies.findIndex(enemy => {
          const collision = (
            bullet.x < enemy.x + TANK_SIZE &&
            bullet.x + BULLET_SIZE > enemy.x &&
            bullet.y < enemy.y + TANK_SIZE &&
            bullet.y + BULLET_SIZE > enemy.y
          );
          if (collision) {
            console.log('检测到碰撞！子弹位置:', bullet, '敌人位置:', enemy);
          }
          return collision;
        });
        
        if (hitIndex !== -1) {
          console.log('敌人被击中！当前分数:', score, '击中索引:', hitIndex);
          state.enemies.splice(hitIndex, 1);
          // 调用updateScore函数，传入增加的分数
          updateScore(100);
          return false;
        }
        
        // 检查子弹是否超出边界
        return (
          bullet.x >= 0 && bullet.x <= CANVAS_WIDTH &&
          bullet.y >= 0 && bullet.y <= CANVAS_HEIGHT
        );
      });
      
      // 生成敌人
      if (state.frameCount % ENEMY_SPAWN_RATE === 0) {
        state.enemies.push({
          x: Math.floor(Math.random() * (CANVAS_WIDTH - TANK_SIZE)),
          y: 0,
          speed: 0.3 + Math.random() * 1 // 降低敌人速度，从1-3降低到0.5-1.5
        });
      }
    }
    
    // 移动敌人和游戏结束检测（仅在游戏未暂停时执行）
    if (!paused) {
      state.enemies.forEach(enemy => {
        enemy.y += enemy.speed;
        
        // 检查敌人是否到达底部
        if (enemy.y >= CANVAS_HEIGHT) {
          handleGameOver();
        }
        
        // 检查敌人是否碰撞玩家
        if (
          enemy.x < state.player.x + TANK_SIZE &&
          enemy.x + TANK_SIZE > state.player.x &&
          enemy.y < state.player.y + TANK_SIZE &&
          enemy.y + TANK_SIZE > state.player.y
        ) {
          handleGameOver();
        }
      });
    }
  };

  // 绘制游戏
  const drawGame = (ctx) => {
    const state = gameState.current;
    
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 如果游戏暂停，显示暂停提示
    if (paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#FFF';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('游戏暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.font = '24px Arial';
      ctx.fillText('按 P 继续游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
      return;
    }
    
    // 绘制经典砖墙背景 - 确保完全覆盖画布
    ctx.fillStyle = '#8B4513'; // 棕色砖墙
    // 使用稍微大一点的尺寸确保完全覆盖canvas，不留黑色边缘
    ctx.fillRect(-1, -1, CANVAS_WIDTH + 2, CANVAS_HEIGHT + 2);
    
    // 绘制砖块纹理
    ctx.fillStyle = '#A0522D';
    const brickSize = 20;
    for (let y = 0; y <= CANVAS_HEIGHT; y += brickSize) {
      for (let x = 0; x <= CANVAS_WIDTH; x += brickSize) {
        if ((x + y) % (brickSize * 2) === 0) {
          ctx.fillRect(x, y, brickSize, brickSize);
        }
      }
    }
    
    // 绘制玩家坦克
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(state.player.x, state.player.y, TANK_SIZE, TANK_SIZE);
    
    // 绘制炮管
    ctx.fillStyle = '#388E3C';
    switch (state.player.direction) {
      case 'up':
        ctx.fillRect(
          state.player.x + TANK_SIZE / 2 - 5,
          state.player.y - 10,
          10,
          15
        );
        break;
      case 'down':
        ctx.fillRect(
          state.player.x + TANK_SIZE / 2 - 5,
          state.player.y + TANK_SIZE - 5,
          10,
          15
        );
        break;
      case 'left':
        ctx.fillRect(
          state.player.x - 10,
          state.player.y + TANK_SIZE / 2 - 5,
          15,
          10
        );
        break;
      case 'right':
        ctx.fillRect(
          state.player.x + TANK_SIZE - 5,
          state.player.y + TANK_SIZE / 2 - 5,
          15,
          10
        );
        break;
    }
    
    // 绘制子弹
    ctx.fillStyle = '#FFC107';
    state.player.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, BULLET_SIZE, BULLET_SIZE);
    });
    
    // 绘制敌人
    ctx.fillStyle = '#1976D2'; // 改变敌人颜色为深蓝色，更美观
    state.enemies.forEach(enemy => {
      ctx.fillRect(enemy.x, enemy.y, TANK_SIZE, TANK_SIZE);
    });
    
    // 绘制分数
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText(`分数: ${score}`, 20, 30);
  };

  // 开始游戏
  const startGame = () => {
    gameState.current = {
      player: {
        x: CANVAS_WIDTH / 2 - TANK_SIZE / 2,
        y: CANVAS_HEIGHT - TANK_SIZE - 20,
        direction: 'up',
        bullets: [],
        cooldown: 0
      },
      enemies: [],
      keys: {},
      frameCount: 0
    };
    setScore(0);
    updateScore(0); // 同步父组件分数
    setGameOver(false);
    setGameStarted(true);
    setGameOverHandled(false); // 重置游戏结束处理标志
  };

  return (
    <div className="tank-game-container">
      {!gameStarted ? (
        <div className="game-start-screen">
          <h2>坦克大战</h2>
          <p>使用方向键移动，空格键发射子弹</p>
          <p>P键暂停</p>
          <p>击败敌方坦克获得分数</p>
          <button onClick={startGame} className="start-button">
            开始游戏
          </button>
        </div>
      ) : gameOver ? (
        <div className="game-over-screen">
          <h2>游戏结束</h2>
          <p>你的最终分数: {score}</p>
          <div className="game-over-buttons">
            <button onClick={startGame} className="restart-button">
              再玩一次
            </button>
            <button onClick={onExit} className="exit-button">
              退出
            </button>
          </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="tank-game-canvas"
        />
      )}
    </div>
  );
};

export default TankGame;