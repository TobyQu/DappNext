"use client";

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

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
} 