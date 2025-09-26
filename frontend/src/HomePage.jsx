import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 导入GAME_TYPES常量
import { GAME_TYPES } from './App';

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  // 检测系统深色模式偏好并初始化
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    if (prefersDark) {
      document.body.classList.add('dark');
    }
  }, []);
  
  // 切换深色模式
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark');
  };

  // 游戏数据
  const games = [
    {
      id: 0, // 对应GAME_TYPES中的索引
      title: "2048",
      icon: "2️⃣",
      description: "经典的2048数字游戏，合并相同数字直到获得2048方块！",
      features: [
        "使用方向键或滑动移动方块",
        "相同数字相撞时会合并",
        "尝试获得2048或更高分",
        "连接钱包保存你的最高分"
      ],
      bgGradient: "linear-gradient(135deg, #faf8ef, #eee4da)",
      darkBgGradient: "linear-gradient(135deg, #2d2a2e, #453f4a)",
      textColor: "#776e65",
      darkTextColor: "#d8cdc0"
    },
    {
      id: 1, // 对应GAME_TYPES中的索引
      title: "青蛙荷塘跳",
      icon: "🐸",
      description: "帮助青蛙跳过荷塘，到达对岸获得高分！",
      features: [
        "使用方向键或滑动控制跳跃",
        "跳到移动的荷叶上不掉入水中",
        "到达对岸获得额外奖励",
        "游戏难度随时间增加"
      ],
      bgGradient: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
      darkBgGradient: "linear-gradient(135deg, #1b3d2f, #2a5c42)",
      textColor: "#2e7d32",
      darkTextColor: "#a5d6a7"
    }
  ];

  return (
    <div className="homepage">
      {/* 现代风格游戏平台主页 */}
      
      {/* 深色模式切换按钮 */}
      <button 
        onClick={toggleDarkMode}
        className="dark-mode-toggle"
        aria-label={darkMode ? "切换到浅色模式" : "切换到深色模式"}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* 英雄区域 */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="text-gradient">Web3 游戏平台</span>
          </h1>
          <p className="hero-subtitle">
            连接您的钱包，畅玩经典游戏，记录您的游戏成就！
          </p>
          <div className="hero-buttons">
            <Link to="/profile" className="btn-primary">
              查看我的游戏记录
            </Link>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="floating-icon">🎮</div>
          <div className="floating-icon">💰</div>
          <div className="floating-icon">🏆</div>
        </div>
      </section>

      {/* 游戏列表 */}
      <section className="games-section">
        <div className="section-header">
          <h2 className="section-title">热门游戏</h2>
          <p className="section-description">选择您喜爱的游戏开始挑战！</p>
        </div>
        
        <div className="games-grid">
          {games.map(game => (
            <div 
              key={game.id} 
              className="game-card"
              style={{
                background: darkMode ? game.darkBgGradient : game.bgGradient,
                color: darkMode ? game.darkTextColor : game.textColor
              }}
            >
              <div className="game-card-header">
                <div className="game-icon">{game.icon}</div>
                <h3 className="game-title">{game.title}</h3>
              </div>
              
              <p className="game-description">{game.description}</p>
              
              <ul className="game-features">
                {game.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-icon">✨</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link 
                to={`/game/${game.id}`} 
                className="play-button"
                style={{
                  background: darkMode ? game.darkTextColor : game.textColor,
                  color: darkMode ? '#111827' : '#ffffff'
                }}
              >
                开始游戏
                <span className="play-icon">▶</span>
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      {/* 特点介绍 */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">平台特点</h2>
          <p className="section-description">为什么选择我们的Web3游戏平台</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">🔗</div>
            <h3 className="feature-card-title">区块链记录</h3>
            <p className="feature-card-description">您的游戏成就将永久记录在区块链上，真实可靠</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-card-icon">🎯</div>
            <h3 className="feature-card-title">公平竞争</h3>
            <p className="feature-card-description">所有游戏数据公开透明，确保每一次挑战都公平公正</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-card-icon">🔒</div>
            <h3 className="feature-card-title">安全可靠</h3>
            <p className="feature-card-description">使用区块链技术保障您的数据安全和游戏体验</p>
          </div>
        </div>
      </section>
      
      {/* CSS样式定义 */}
      <style jsx>{`
        .homepage {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
          position: relative;
          overflow-x: hidden;
        }
        
        /* 深色模式切换按钮 */
        .dark-mode-toggle {
          position: fixed;
          top: 2rem;
          right: 2rem;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: var(--gray-100);
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
          z-index: 999;
        }
        
        body.dark .dark-mode-toggle {
          background: var(--gray-800);
        }
        
        .dark-mode-toggle:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-lg);
        }
        
        /* 英雄区域 */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 1rem;
          margin-bottom: 3rem;
          position: relative;
          border-radius: var(--radius-2xl);
          background: var(--gray-100);
          overflow: hidden;
        }
        
        body.dark .hero {
          background: var(--gray-800);
        }
        
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }
        
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.1;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          padding: 0.75rem 2rem;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }
        
        /* 英雄区域装饰 */
        .hero-decoration {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        
        .floating-icon {
          position: absolute;
          font-size: 2rem;
          animation: float 8s ease-in-out infinite;
        }
        
        .floating-icon:nth-child(1) {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .floating-icon:nth-child(2) {
          bottom: 20%;
          right: 15%;
          animation-delay: 2s;
        }
        
        .floating-icon:nth-child(3) {
          top: 60%;
          left: 25%;
          animation-delay: 4s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        
        /* 游戏区域 */
        .games-section {
          margin-bottom: 4rem;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .section-title {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        
        .section-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }
        
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .game-card {
          border-radius: var(--radius-xl);
          padding: 2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-lg);
          position: relative;
          overflow: hidden;
          transform: translateY(0);
        }
        
        .game-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-xl);
        }
        
        .game-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .game-icon {
          font-size: 3rem;
          line-height: 1;
        }
        
        .game-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }
        
        .game-description {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .game-features {
          list-style: none;
          margin: 0 0 2rem 0;
          padding: 0;
        }
        
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }
        
        .feature-icon {
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .play-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 1rem;
          border-radius: var(--radius-lg);
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }
        
        .play-button:hover {
          transform: scale(1.02);
        }
        
        .play-icon {
          transition: transform 0.3s ease;
        }
        
        .play-button:hover .play-icon {
          transform: translateX(3px);
        }
        
        /* 特点区域 */
        .features-section {
          margin-bottom: 3rem;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .feature-card {
          background: var(--gray-100);
          border-radius: var(--radius-xl);
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-md);
        }
        
        body.dark .feature-card {
          background: var(--gray-800);
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }
        
        .feature-card-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .feature-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        
        .feature-card-description {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.125rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .games-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .game-card {
            padding: 1.5rem;
          }
          
          .dark-mode-toggle {
            top: 1rem;
            right: 1rem;
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero {
            padding: 3rem 1rem;
          }
          
          .btn-primary {
            padding: 0.75rem 1.5rem;
            font-size: 0.95rem;
          }
        }
      `}</style>
      {/* 关于平台 */}
      <section className="about">
        <div className="container">
          <h2>关于我们的平台</h2>
          <p>Web3游戏平台是一个基于区块链技术的游戏集合，让您可以在享受游戏乐趣的同时，将您的游戏成就永久记录在区块链上。我们致力于为玩家提供安全、公平、透明的游戏体验。</p>
          <div className="features">
            <div className="feature">
              <h3>区块链记录</h3>
              <p>您的游戏成就永久保存在区块链上，真实可靠</p>
            </div>
            <div className="feature">
              <h3>公平透明</h3>
              <p>基于智能合约的游戏逻辑，确保游戏公平性</p>
            </div>
            <div className="feature">
              <h3>多游戏支持</h3>
              <p>持续更新更多有趣的游戏，满足不同玩家的需求</p>
            </div>
        </div>
        </div>
      </section>

      {/* 底部CTA */}
      <section className="cta">
        <div className="container">
          <h2>准备好开始游戏了吗？</h2>
          <p>连接您的钱包，选择喜欢的游戏，开始您的Web3游戏之旅！</p>
          <div className="game-cta-buttons">
            {games.map(game => (
              <Link 
                key={game.id} 
                to={`/game/${game.id}`} 
                className="btn game-btn"
                style={{
                  backgroundColor: game.textColor,
                  color: game.bgColor
                }}
              >
                {game.icon} 开始玩 {game.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>Web3 Game Platform</h3>
              <p>基于区块链的游戏平台</p>
            </div>
            <div className="footer-links">
              <h4>快速链接</h4>
              <ul>
                <li><Link to="/">首页</Link></li>
                <li><Link to="/profile">游戏记录</Link></li>
              </ul>
            </div>
            <div className="footer-contact">
              <h4>联系我们</h4>
              <p>邮箱: contact@web3game.com</p>
              <p>Twitter: @Web3GamePlatform</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2023 Web3 Game Platform. 保留所有权利.</p>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default HomePage;