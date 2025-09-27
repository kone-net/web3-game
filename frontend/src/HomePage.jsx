import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 导入GAME_TYPES常量和样式
import { GAME_TYPES } from './App';
import './HomePage.css';

const HomePage = () => {
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
    },
    {
      id: 2, // 对应GAME_TYPES中的索引
      title: "坦克大战",
      icon: "🚀",
      description: "经典坦克对战游戏，击败敌方坦克获得胜利！",
      features: [
        "使用方向键控制坦克移动",
        "空格键发射子弹",
        "摧毁敌方坦克获得积分",
        "保护基地不被摧毁"
      ],
      bgGradient: "linear-gradient(135deg, #fff1e6, #ffd7ba)",
      darkBgGradient: "linear-gradient(135deg, #4a3a2a, #6b5a4a)",
      textColor: "#d9480f",
      darkTextColor: "#ffd8a8"
    }
  ];
  
  // 获取当前深色模式状态
  const darkMode = document.body.classList.contains('dark');

  return (
    <div className="homepage">
      {/* 现代风格游戏平台主页 */}
      
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
          <div className="floating-icon">⚡</div>
          <div className="floating-icon">🚀</div>
          <div className="floating-icon">✨</div>
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
              className={`game-card game-card-${game.id === 0 ? '2048' : 'frog'}`}
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
                className={`play-button play-button-${game.id === 0 ? '2048' : 'frog'}`}
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
      
      {/* 关于平台 */}
      <section className="about-section">
        <div className="section-header">
          <h2 className="section-title">关于我们的平台</h2>
          <p className="section-description">基于区块链技术的创新游戏生态系统</p>
        </div>
        
        <div className="about-content">
          <p className="about-text">
            Web3游戏平台是一个基于区块链技术的游戏集合，让您可以在享受游戏乐趣的同时，将您的游戏成就永久记录在区块链上。我们致力于为玩家提供安全、公平、透明的游戏体验。
          </p>
          
          <div className="about-features">
            <div className="about-feature-card">
              <div className="about-feature-icon">📊</div>
              <h3 className="about-feature-title">区块链记录</h3>
              <p className="about-feature-description">您的游戏成就永久保存在区块链上，真实可靠</p>
            </div>
            
            <div className="about-feature-card">
              <div className="about-feature-icon">⚖️</div>
              <h3 className="about-feature-title">公平透明</h3>
              <p className="about-feature-description">基于智能合约的游戏逻辑，确保游戏公平性</p>
            </div>
            
            <div className="about-feature-card">
              <div className="about-feature-icon">🎮</div>
              <h3 className="about-feature-title">多游戏支持</h3>
              <p className="about-feature-description">持续更新更多有趣的游戏，满足不同玩家的需求</p>
            </div>
          </div>
        </div>
      </section>

      {/* 底部CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">准备好开始游戏了吗？</h2>
          <p className="cta-description">连接您的钱包，选择喜欢的游戏，开始您的Web3游戏之旅！</p>
          
          <div className="cta-buttons">
            {games.map(game => (
              <Link 
                key={game.id} 
                to={`/game/${game.id}`} 
                className="cta-game-button"
              >
                <span className="cta-game-icon">{game.icon}</span>
                <span className="cta-game-text">开始玩 {game.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
                  <li><Link to="/" className="footer-link">首页</Link></li>
                  <li><Link to="/profile" className="footer-link">游戏记录</Link></li>
                  <li><Link to="/faq" className="footer-link">常见问题</Link></li>
                </ul>
              </div>
              
              <div className="footer-links-column">
                <h4 className="footer-links-title">联系我们</h4>
                <ul className="footer-links-list">
                  <li><a href="mailto:contact@web3game.com" className="footer-link">contact@web3game.com</a></li>
                  <li><a href="https://twitter.com/Web3GamePlatform" className="footer-link">@Web3GamePlatform</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">&copy; 2025 Web3 Game Platform. 保留所有权利.</p>
            <div className="footer-legal">
              <Link to="/privacy" className="legal-link">隐私政策</Link>
              <Link to="/terms" className="legal-link">使用条款</Link>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default HomePage;