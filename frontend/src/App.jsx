import { useState, useEffect } from 'react'
import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import './App.css'
import HomePage from './HomePage'


// 合约ABI (Application Binary Interface)
const ticketCollectionABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "ticketUrl",
          "type": "string"
        }
      ],
      "name": "addTicket",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "url",
          "type": "string"
        }
      ],
      "name": "addUrl",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllUrls",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTickets",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

// 合约地址
const contractAddress = '0x90EA3D281a49Dc8D90df83F2a37Ef434969c1a14'

function ManagementInterface() {
  const navigate = useNavigate();
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    watch: true
  })
  const [lastTransactionHash, setLastTransactionHash] = useState('')

  
  // 获取票据列表的hook
  const { data: ticketsData, refetch: refetchTickets, isLoading: isTicketsLoading } = useReadContract({
    address: contractAddress,
    abi: ticketCollectionABI,
    functionName: 'getAllUrls',
    // functionName: 'getTickets',
  })

  console.log("data are ", ticketsData, isTicketsLoading, "address:", address)

  
  // 添加票据的hook
  const { writeContract, isPending: isAddTicketPending, data: txHash } = useWriteContract()
  console.log("isAddTicketPending", isAddTicketPending, " txHash", txHash)
  
  // 等待交易确认的Hook
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: txError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  console.log("isConfirming", isConfirming, " isConfirmed", isConfirmed)
  

  useEffect(() => {
    refetchTickets();

    // 检查hash是否存在
    if (txHash) {
      console.log('票据添加成功！交易哈希:', txHash);
      // 保存交易哈希用于回显
      setLastTransactionHash(txHash);
      // 移除alert，使用界面状态显示
    } else {
      console.log('票据添加成功，但未返回交易哈希');
    }
  }, [isConfirmed, refetchTickets])

  
  // 本地状态
  const [ticketUrl, setTicketUrl] = useState('')
  const [userTicketsData, setUserTicketsData] = useState([])
  const [loading, setLoading] = useState(false)

  // RainbowKit自动处理连接/断开钱包操作
  // 钱包连接状态变化时自动刷新票据列表
  useEffect(() => {
    if (isConnected) {
      // 延迟一小段时间确保钱包完全连接
      const timer = setTimeout(() => {
        refetchTickets();
      }, 500);
      return () => clearTimeout(timer);
    } else {
        setUserTicketsData([]);
      }
  }, [isConnected, refetchTickets])

  // 添加新票据
  const addNewTicket = async () => {
    if (!ticketUrl.trim()) {
      console.error('票据链接为空，请输入票据链接');
      alert('请输入票据链接');
      return
    }
    
    try {
      console.log('开始上传票据，URL:', ticketUrl);
      setLoading(true);
      
      // 使用Wagmi的writeContract hook添加票据
      // 在Wagmi v2中，writeContract返回Promise，解析为交易哈希字符串
      const hash = await writeContract({
        address: contractAddress,
        abi: ticketCollectionABI,
        functionName: 'addUrl',
        // functionName: 'addTicket',
        args: [ticketUrl],
      })
      
      console.log('交易已发送，等待确认...');
      
      setTicketUrl('')
      
      // 交易需要时间确认，添加延迟后再刷新票据列表
      setTimeout(() => {
        refetchTickets();
        console.log('交易已确认，刷新票据列表');
      }, 3000);
    } catch (error) {
      console.error('添加票据失败:', error);
      alert('添加票据失败。错误信息：' + error.message);
    } finally {
      setLoading(false)
    }
  }

  // 监听票据数据变化并更新本地状态
  useEffect(() => {
    if (ticketsData && address) {
      // 直接使用字符串数组
      setUserTicketsData(ticketsData)
      console.log('加载票据成功，共', ticketsData.length, '张票据');
    } else if (!address) {
      setUserTicketsData([]);
      console.log('钱包未连接，清空票据数据');
    }
  }, [ticketsData, address])
  
  // 显示余额信息
  const formatBalance = () => {
    if (!balance) return '0 ETH';
    // 格式化余额为可读的ETH格式
    return (Number(balance.value) /  Number(1e18)).toFixed(8) + ' ETH';
  }
  
  // 截断过长的URL显示，保留开头和结尾部分
  const truncateUrl = (url, maxLength = 50) => {
    if (!url || url.length <= maxLength) return url;
    const startLength = Math.floor(maxLength / 2);
    const endLength = maxLength - startLength - 3;
    return url.substring(0, startLength) + '...' + url.substring(url.length - endLength);
  }
  
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // 复制完整URL到剪贴板
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      // 2秒后重置复制状态
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch((err) => {
      console.error('复制失败:', err);
    });
  }
  


  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1>票据收藏管理系统</h1>
          <button 
            className="nav-button" 
            onClick={() => navigate('/')}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            返回首页
          </button>
        </div>
        <div className="wallet-section">
          {isConnected ? (
            <div className="wallet-actions">
              <span className="account-info">
                已连接: {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </span>
              <span className="balance-info">
                余额: {isBalanceLoading ? '加载中...' : formatBalance()}
              </span>
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </header>
      
      <main className="app-main">
        <section className="upload-section">
          <h2>上传新票据</h2>
          <div className="upload-form">
            <input
              type="text"
              placeholder="请输入票据链接"
              value={ticketUrl}
              onChange={(e) => setTicketUrl(e.target.value)}
              className="ticket-input"
              disabled={!isConnected}
            />
            <button 
              className="upload-button" 
              onClick={addNewTicket}
              disabled={!isConnected || loading || !ticketUrl || isAddTicketPending}
            >
              {loading || isAddTicketPending ? '处理中...' : '上传票据'}
            </button>
            {!isConnected && (
              <div className="status-info">请先连接钱包</div>
            )}
            {isConnected && !ticketUrl && (
              <div className="status-info">请输入票据链接</div>
            )}
            
            {/* 交易状态显示 */}
            {isAddTicketPending && (
              <div className="transaction-status pending">交易已发送，等待确认...</div>
            )}
            {isConfirming && !isAddTicketPending && (
              <div className="transaction-status confirming">交易确认中...</div>
            )}
            {isConfirmed && !isConfirming && !isAddTicketPending && (
              <div className="transaction-status success">交易成功！</div>
            )}
            {txError && (
              <div className="transaction-status error">交易失败：{txError.message}</div>
            )}
            
            {/* 上一次交易哈希回显 */}
            {lastTransactionHash && (
              <div className="last-transaction">
                上一次交易哈希：{lastTransactionHash.substring(0, 10)}...{lastTransactionHash.substring(lastTransactionHash.length - 10)}
              </div>
            )}
          </div>
        </section>

        <section className="tickets-section">
          <h2>我的票据收藏</h2>
          {isTicketsLoading || loading ? (
            <div className="loading">加载中...</div>
          ) : !isConnected ? (
            <div className="no-wallet">请先连接MetaMask钱包查看您的票据</div>
          ) : userTicketsData.length === 0 ? (
            <div className="no-tickets">您还没有收藏任何票据</div>
          ) : (
            <div className="tickets-list">
              {userTicketsData.map((ticket, index) => (
                <div key={index} className="ticket-item">
                  <div className="ticket-content">
                    <span className="ticket-label">票据链接: </span>
                    <div className="url-container">
                      <span 
                        className="ticket-url" 
                        title={ticket}
                      >
                        {truncateUrl(ticket)}
                      </span>
                      <button 
                        className={`copy-button ${copiedIndex === index ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(ticket, index)}
                        title={copiedIndex === index ? "已复制!" : "复制完整链接"}
                        aria-label={copiedIndex === index ? "已复制" : "复制链接"}
                      >
                        {copiedIndex === index ? "✓" : "❏"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>票据收藏管理系统 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

// 主应用组件，包含路由配置
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<ManagementInterface />} />
      </Routes>
    </Router>
  )
}

export default App
