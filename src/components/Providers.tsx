"use client";

import { useState, useEffect } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig, Chain } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

// 定义本地测试网络 - Hardhat/Ganache
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
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
};

const { chains, provider } = configureChains(
  [localhost, goerli], // 使用本地测试网络和Goerli测试网
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === localhost.id) {
          return { http: chain.rpcUrls.default.http[0] };
        }
        return null;
      },
    }),
    publicProvider(), // 使用公共提供者作为备选
  ]
);

// 旧版RainbowKit使用不同的API
const { connectors } = getDefaultWallets({
  appName: 'Web3 DApp',
  chains
});

// 检查用户之前是否已连接钱包
function wasWalletConnected(): boolean {
  if (typeof window === 'undefined') return false;
  
  // RainbowKit/wagmi 在 localStorage 中存储连接状态
  const rainbowKitConnection = localStorage.getItem('rk-connected');
  const wagmiConnection = localStorage.getItem('wagmi.connected');
  
  return rainbowKitConnection === 'true' || wagmiConnection === 'true';
}

// 根据之前的连接状态创建客户端
const wagmiClient = createClient({
  autoConnect: wasWalletConnected(), // 如果之前连接过，则自动连接
  connectors,
  provider
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 使用挂载检查确保hydration不会出问题
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        {mounted ? children : null}
      </RainbowKitProvider>
    </WagmiConfig>
  );
} 