'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { getTokenInfo, getTokenBalance } from '@/lib/tokenContract';

/**
 * TokenInfo 组件
 * 显示代币的基本信息和当前用户的代币余额
 */
export default function TokenInfo() {
  // 获取当前连接的钱包地址
  const { address, isConnected } = useAccount();
  
  // 状态管理
  const [tokenInfo, setTokenInfo] = useState({
    name: '加载中...',
    symbol: '...',
    decimals: 18,
    totalSupply: '0'
  });
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);

  // 加载代币信息
  useEffect(() => {
    const loadTokenInfo = async () => {
      try {
        setIsLoading(true);
        // 获取代币基本信息
        const info = await getTokenInfo();
        setTokenInfo(info);
        
        // 如果钱包已连接，获取用户余额
        if (isConnected && address) {
          const userBalance = await getTokenBalance(address);
          setBalance(userBalance);
        }
      } catch (error) {
        console.error('加载代币信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokenInfo();
    
    // 每 30 秒刷新一次数据
    const intervalId = setInterval(loadTokenInfo, 30000);
    
    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, [address, isConnected]);

  // 手动刷新数据
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // 获取代币基本信息
      const info = await getTokenInfo();
      setTokenInfo(info);
      
      // 如果钱包已连接，获取用户余额
      if (isConnected && address) {
        const userBalance = await getTokenBalance(address);
        setBalance(userBalance);
      }
    } catch (error) {
      console.error('刷新代币信息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold">
          {tokenInfo.name} <Badge>{tokenInfo.symbol}</Badge>
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isLoading}
        >
          {isLoading ? '加载中...' : '刷新'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">总供应量</p>
              <p className="text-xl font-medium">
                {tokenInfo.totalSupply} {tokenInfo.symbol}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">小数位数</p>
              <p className="text-xl font-medium">{tokenInfo.decimals}</p>
            </div>
          </div>
          
          {isConnected ? (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">你的余额</p>
              <p className="text-2xl font-bold">
                {balance} {tokenInfo.symbol}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              请连接钱包查看你的代币余额
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 