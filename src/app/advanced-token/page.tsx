'use client';

import { useAccount } from 'wagmi';
import TokenInfo from '@/components/TokenInfo';
import TokenTransfer from '@/components/TokenTransfer';
import { TokenAdmin } from '@/components/TokenAdmin';

/**
 * 高级代币页面
 * 集成代币信息展示、转账功能和管理员功能
 */
export default function AdvancedTokenPage() {
  // 获取钱包连接状态
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">高级代币管理</h1>
      
      {/* 代币部署组件 */}
      <div className="mb-8">
        <TokenAdmin />
      </div>
      
      {/* 代币信息卡片 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">代币信息</h2>
        <TokenInfo />
      </div>
      
      {/* 代币转账功能 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">转账代币</h2>
        <TokenTransfer />
      </div>
    </div>
  );
} 