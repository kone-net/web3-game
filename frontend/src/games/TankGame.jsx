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
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOverHandled, setGameOverHandled] = useState(false); // 防止重复处理
  
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
  const updateScore = (newScore) => {
    setScore(newScore);
    if (onScoreUpdate) {
      onScoreUpdate(newScore);
    }
  };
  
  // 处理游戏结束
  const handleGameOver = () => {
    if (gameOverHandled) return;
    
    setGameOverHandled(true);
    setGameOver(true);
    
    if (onGameOver) {
      onGameOver(score);
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
      gameState.current.keys[e.key] = true;
      
      // 空格键发射子弹
      if (e.key === ' ' && gameState.current.player.cooldown === 0) {
        const bullet = {
          x: gameState.current.player.x + TANK_SIZE / 2 - BULLET_SIZE / 2,
          y: gameState.current.player.y + TANK_SIZE / 2 - BULLET_SIZE / 2,
          direction: gameState.current.player.direction
        };
        gameState.current.player.bullets.push(bullet);
        gameState.current.player.cooldown = 20;
      }
    };
    
    const handleKeyUp = (e) => {
      gameState.current.keys[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // 游戏循环
    let animationFrameId;
    const gameLoop = () => {
      updateGame();
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
  }, [gameStarted, gameOver]);

  // 更新游戏状态
  const updateGame = () => {
    const state = gameState.current;
    state.frameCount++;
    
    // 移动玩家坦克
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
    
    // 冷却时间
    if (state.player.cooldown > 0) {
      state.player.cooldown--;
    }
    
    // 移动子弹
    state.player.bullets = state.player.bullets.filter(bullet => {
      switch (bullet.direction) {
        case 'up': bullet.y -= BULLET_SPEED; break;
        case 'down': bullet.y += BULLET_SPEED; break;
        case 'left': bullet.x -= BULLET_SPEED; break;
        case 'right': bullet.x += BULLET_SPEED; break;
      }
      
      // 检查子弹是否击中敌人
      const hitIndex = state.enemies.findIndex(enemy => {
        return (
          bullet.x < enemy.x + TANK_SIZE &&
          bullet.x + BULLET_SIZE > enemy.x &&
          bullet.y < enemy.y + TANK_SIZE &&
          bullet.y + BULLET_SIZE > enemy.y
        );
      });
      
      if (hitIndex !== -1) {
        state.enemies.splice(hitIndex, 1);
        const newScore = score + 100;
        updateScore(newScore);
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
        speed: 1 + Math.random() * 2
      });
    }
    
    // 移动敌人
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
  };

  // 绘制游戏
  const drawGame = (ctx) => {
    const state = gameState.current;
    
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制经典砖墙背景
    ctx.fillStyle = '#8B4513'; // 棕色砖墙
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制砖块纹理
    ctx.fillStyle = '#A0522D';
    const brickSize = 20;
    for (let y = 0; y < CANVAS_HEIGHT; y += brickSize) {
      for (let x = 0; x < CANVAS_WIDTH; x += brickSize) {
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
    ctx.fillStyle = '#F44336';
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