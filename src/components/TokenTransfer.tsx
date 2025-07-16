'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { transferToken, getTokenBalance } from '@/lib/tokenContract';

/**
 * TokenTransfer 组件
 * 提供代币转账功能
 */
export default function TokenTransfer() {
  // 获取当前连接的钱包地址
  const { address, isConnected } = useAccount();
  
  // 状态管理
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // 处理转账
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的消息
    setError(null);
    setSuccess(null);
    setTxHash(null);
    
    // 输入验证
    if (!recipient) {
      setError('请输入接收地址');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效的转账金额');
      return;
    }
    
    // 检查地址格式
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      setError('无效的以太坊地址格式');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 调用转账函数
      const result = await transferToken(recipient, amount);
      
      if (result.success) {
        // 转账成功
        setSuccess(`成功转账 ${amount} 代币到 ${recipient.substring(0, 6)}...${recipient.substring(38)}`);
        setTxHash(result.hash);
        
        // 清空表单
        setRecipient('');
        setAmount('');
        
        // 如果钱包已连接，刷新余额
        if (isConnected && address) {
          await getTokenBalance(address);
        }
      } else {
        // 转账失败
        setError(`转账失败: ${result.error}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`发生错误: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>转账代币</CardTitle>
        <CardDescription>
          将你的代币转账给其他地址
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <Alert>
            <AlertDescription>
              请先连接钱包以使用转账功能
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">接收地址</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">转账金额</Label>
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription>
                  {success}
                  {txHash && (
                    <div className="mt-2">
                      <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        在区块浏览器查看交易
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !recipient || !amount}
            >
              {isLoading ? '处理中...' : '转账'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 