"use client";

import { useState, useEffect } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig, Chain } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

// 定义本地测试网络 - Hardhat/Ganache 
// 适配 wagmi 0.6.8 的 Chain 类型
const localhost: Chain = {
  id: 1337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: 'http://127.0.0.1:8545',
    public: 'http://127.0.0.1:8545',
  },
};

// 配置链和提供者
const { chains, provider } = configureChains(
  [localhost, goerli], // 使用本地测试网络和Goerli测试网
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === localhost.id) {
          return { http: chain.rpcUrls.default };
        }
        return null;
      },
    }),
    publicProvider(), // 使用公共提供者作为备选
  ]
);

// 早期版本的 RainbowKit 和 wagmi（v0.4.8 和 v0.6.8）
// 这些版本使用 WalletConnect v1，不需要 projectId
const { connectors } = getDefaultWallets({
  appName: 'Web3',
  chains
});

// 检查用户之前是否已连接钱包
function wasWalletConnected(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    // RainbowKit/wagmi 在 localStorage 中存储连接状态
    const rainbowKitConnection = localStorage.getItem('rk-connected');
    const wagmiConnection = localStorage.getItem('wagmi.connected');
    
    return rainbowKitConnection === 'true' || wagmiConnection === 'true';
  } catch (error) {
    console.error('检查钱包连接状态时出错:', error);
    return false;
  }
}

// 根据之前的连接状态创建客户端
const wagmiClient = createClient({
  autoConnect: wasWalletConnected(), // 如果之前连接过，则自动连接
  connectors,
  provider
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [clientError, setClientError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      setMounted(true);
    } catch (error) {
      console.error('提供者组件挂载时出错:', error);
      setClientError(error instanceof Error ? error : new Error('未知错误'));
    }
    
    // 添加全局错误处理器来捕获钱包连接错误
    const handleError = (event: ErrorEvent) => {
      console.error('捕获到全局错误:', event.error);
      // 检查是否为钱包相关错误
      if (event.error && event.error.message && 
         (event.error.message.includes('wallet') || 
          event.error.message.includes('ethereum') ||
          event.error.message.includes('MetaMask'))) {
        setClientError(event.error);
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // 错误处理
  if (clientError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">连接钱包时出现错误</h3>
        <p className="mt-1 text-sm text-red-700">{clientError.message}</p>
        <button
          className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          onClick={() => window.location.reload()}
        >
          刷新页面
        </button>
      </div>
    );
  }

  // 使用挂载检查确保hydration不会出问题
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider 
        chains={chains}
        theme={lightTheme({
          accentColor: '#7b3fe4', // 自定义主题颜色
          borderRadius: 'medium'
        })}
      >
        {mounted ? children : 
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-gray-500">加载中...</div>
          </div>
        }
      </RainbowKitProvider>
    </WagmiConfig>
  );
} 