import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredLinks, setFeaturedLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟获取前6个收藏链接
  useEffect(() => {
    // 在实际应用中，这里应该从区块链或后端API获取数据
    // 现在使用模拟数据
    const mockLinks = [
      { id: 1, url: 'https://www.example.com/link1', title: '区块链技术概述' },
      { id: 2, url: 'https://www.example.com/link2', title: '智能合约开发指南' },
      { id: 3, url: 'https://www.example.com/link3', title: '去中心化应用案例' },
      { id: 4, url: 'https://www.example.com/link4', title: '区块链安全最佳实践' },
      { id: 5, url: 'https://www.example.com/link5', title: 'Web3.0发展趋势' },
      { id: 6, url: 'https://www.example.com/link6', title: '区块链金融应用' },
    ];

    // 模拟网络请求延迟
    setTimeout(() => {
      setFeaturedLinks(mockLinks);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleEnterApp = () => {
    navigate('/admin');
  };

  return (
    <div className="homepage-container">
      {/* 导航栏 */}
      <header className="navbar">
        <div className="logo">收藏链</div>
        <nav className="nav-links">
          <a href="#about">关于我们</a>
          <a href="#features">核心功能</a>
          <a href="#gallery">区块链图库</a>
          <a href="#links">精选链接</a>
        </nav>
        <button className="nav-button" onClick={handleEnterApp}>
          进入管理
        </button>
      </header>

      {/* 英雄区域 */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>收藏链 - 区块链链接管理平台</h1>
          <p>安全、去中心化的链接收藏解决方案，基于区块链技术确保您的数据永久保存且不可篡改</p>
          <button className="primary-button" onClick={handleEnterApp}>
            立即开始
          </button>
        </div>
        <div className="hero-image">
          <svg viewBox="0 0 500 300" className="blockchain-svg">
            <rect x="50" y="50" width="100" height="100" rx="5" fill="#f0f0f0" stroke="#3498db" strokeWidth="2" />
            <rect x="200" y="50" width="100" height="100" rx="5" fill="#f0f0f0" stroke="#3498db" strokeWidth="2" />
            <rect x="350" y="50" width="100" height="100" rx="5" fill="#f0f0f0" stroke="#3498db" strokeWidth="2" />
            <rect x="50" y="200" width="100" height="100" rx="5" fill="#f0f0f0" stroke="#3498db" strokeWidth="2" />
            <rect x="200" y="200" width="100" height="100" rx="5" fill="#f0f0f0" stroke="#3498db" strokeWidth="2" />
            <rect x="350" y="200" width="100" height="100" rx="5" fill="#f0f0f0" stroke="#3498db" strokeWidth="2" />
            <line x1="150" y1="100" x2="200" y2="100" stroke="#e74c3c" strokeWidth="3" strokeDasharray="5,5" />
            <line x1="300" y1="100" x2="350" y2="100" stroke="#e74c3c" strokeWidth="3" strokeDasharray="5,5" />
            <line x1="150" y1="250" x2="200" y2="250" stroke="#e74c3c" strokeWidth="3" strokeDasharray="5,5" />
            <line x1="300" y1="250" x2="350" y2="250" stroke="#e74c3c" strokeWidth="3" strokeDasharray="5,5" />
            <line x1="100" y1="150" x2="100" y2="200" stroke="#2ecc71" strokeWidth="3" strokeDasharray="5,5" />
            <line x1="250" y1="150" x2="250" y2="200" stroke="#2ecc71" strokeWidth="3" strokeDasharray="5,5" />
            <line x1="400" y1="150" x2="400" y2="200" stroke="#2ecc71" strokeWidth="3" strokeDasharray="5,5" />
          </svg>
        </div>
      </section>

      {/* 关于我们 */}
      <section id="about" className="about-section">
        <h2>关于收藏链</h2>
        <div className="about-content">
          <p>收藏链是一款基于区块链技术的链接管理平台，为用户提供安全、去中心化的链接收藏解决方案。</p>
          <p>我们的平台利用区块链的不可篡改性和分布式存储特性，确保您收藏的链接永久保存且不被任意修改。通过智能合约技术，您完全掌控自己的数据，无需依赖中心化服务器。</p>
          <p>无论您是区块链爱好者、开发者还是普通用户，收藏链都能为您提供简单易用且安全可靠的链接管理体验。</p>
        </div>
      </section>

      {/* 核心功能 */}
      <section id="features" className="features-section">
        <h2>核心功能</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>区块链安全</h3>
            <p>利用区块链技术确保数据安全可靠，防止数据丢失和篡改</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>永久保存</h3>
            <p>去中心化存储确保您的链接永久保存，不受服务器故障影响</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>智能管理</h3>
            <p>便捷的分类、搜索和管理功能，让您轻松找到需要的链接</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>多端同步</h3>
            <p>支持多平台访问，随时随地管理您的链接收藏</p>
          </div>
        </div>
      </section>

      {/* 区块链图库 */}
      <section id="gallery" className="gallery-section">
        <h2>区块链图库</h2>
        <div className="gallery-grid">
          <div className="gallery-item">
            <svg viewBox="0 0 300 200" className="blockchain-icon">
              <circle cx="150" cy="100" r="80" fill="#f0f0f0" stroke="#3498db" strokeWidth="2" />
              <text x="150" y="100" textAnchor="middle" dy=".3em" fill="#3498db" fontSize="12">区块链技术</text>
              <line x1="150" y1="20" x2="150" y2="50" stroke="#e74c3c" strokeWidth="2" />
              <line x1="150" y1="150" x2="150" y2="180" stroke="#e74c3c" strokeWidth="2" />
              <line x1="20" y1="100" x2="50" y2="100" stroke="#e74c3c" strokeWidth="2" />
              <line x1="250" y1="100" x2="280" y2="100" stroke="#e74c3c" strokeWidth="2" />
            </svg>
          </div>
          <div className="gallery-item">
            <svg viewBox="0 0 300 200" className="blockchain-icon">
              <rect x="50" y="50" width="200" height="100" rx="10" fill="#f0f0f0" stroke="#2ecc71" strokeWidth="2" />
              <text x="150" y="80" textAnchor="middle" dy=".3em" fill="#2ecc71" fontSize="12">智能合约</text>
              <rect x="70" y="100" width="50" height="30" rx="5" fill="#ffffff" stroke="#2ecc71" strokeWidth="1" />
              <rect x="140" y="100" width="50" height="30" rx="5" fill="#ffffff" stroke="#2ecc71" strokeWidth="1" />
              <rect x="210" y="100" width="50" height="30" rx="5" fill="#ffffff" stroke="#2ecc71" strokeWidth="1" />
            </svg>
          </div>
          <div className="gallery-item">
            <svg viewBox="0 0 300 200" className="blockchain-icon">
              <polygon points="150,30 50,170 250,170" fill="#f0f0f0" stroke="#9b59b6" strokeWidth="2" />
              <text x="150" y="120" textAnchor="middle" dy=".3em" fill="#9b59b6" fontSize="12">去中心化</text>
              <circle cx="100" cy="90" r="10" fill="#ffffff" stroke="#9b59b6" strokeWidth="1" />
              <circle cx="150" cy="60" r="10" fill="#ffffff" stroke="#9b59b6" strokeWidth="1" />
              <circle cx="200" cy="90" r="10" fill="#ffffff" stroke="#9b59b6" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </section>

      {/* 精选链接 */}
      <section id="links" className="links-section">
        <h2>精选链接</h2>
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="links-grid">
            {featuredLinks.map((link) => (
              <div key={link.id} className="link-card">
                <h3>{link.title}</h3>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url">
                  {link.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 底部CTA */}
      <section className="cta-section">
        <h2>准备好开始使用了吗？</h2>
        <p>加入收藏链，体验区块链技术带来的安全链接管理</p>
        <button className="primary-button" onClick={handleEnterApp}>
          进入管理界面
        </button>
      </section>

      {/* 页脚 */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">收藏链</div>
          <div className="footer-links">
            <a href="#about">关于我们</a>
            <a href="#features">功能介绍</a>
            <a href="#gallery">区块链图库</a>
            <a href="#links">精选链接</a>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} 收藏链 - 基于区块链技术的链接管理平台
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;