'use client';

import TokenInfo from '@/components/TokenInfo';
import TokenTransfer from '@/components/TokenTransfer';
import { TokenAdmin } from '@/components/TokenAdmin';
import { useAccount } from 'wagmi';

/**
 * 代币页面
 * 集成代币信息展示和转账功能
 */
export default function TokenPage() {
  // 获取钱包连接状态
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">我的代币</h1>
      
      {/* 代币部署组件 */}
      <div className="mb-8">
        <TokenAdmin />
      </div>
      
      {/* 代币信息卡片 */}
      <div className="mb-8">
        <TokenInfo />
      </div>
      
      {/* 代币转账功能 */}
      <div className="mb-8">
        <TokenTransfer />
      </div>
    </div>
  );
} 