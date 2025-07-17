'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { transferToken } from '@/lib/tokenContract';
import { transferAdvancedToken } from '@/lib/advancedTokenContract';
import config from '@/lib/config';

interface TokenTradingProps {
  tokenId: string;
  tokenSymbol: string;
  tokenPrice: number;
  onTradeComplete?: () => void;
  isBuy?: boolean;
}

export default function TokenTrading({
  tokenId,
  tokenSymbol,
  tokenPrice,
  onTradeComplete,
  isBuy = true
}: TokenTradingProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [usdValue, setUsdValue] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tradeResult, setTradeResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 市场地址（从配置文件中获取）
  // 实际应用中应该使用专用的交易所合约地址
  const marketAddress = config.contract.marketAddress;
  
  // 当金额变化时，计算美元价值
  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value && !isNaN(Number(value))) {
      const usd = Number(value) * tokenPrice;
      setUsdValue(usd.toFixed(2));
    } else {
      setUsdValue('0');
    }
  };

  // 执行交易
  const handleTrade = async () => {
    if (!isConnected || !address || !amount || Number(amount) <= 0) {
      setTradeResult({
        success: false,
        message: '请连接钱包并输入有效的数量'
      });
      return;
    }

    setIsProcessing(true);
    setTradeResult(null);

    try {
      let result;
      
      // 根据代币ID选择适当的合约接口
      if (isBuy) {
        // 买入代币：调用市场地址的转账函数（模拟从市场购买）
        // 注意：在实际生产环境中，需要使用专用的交易所合约
        if (tokenId === 'mytoken') {
          // 注：这里的买入操作实际上是从市场地址转到用户地址的操作
          // 在真实环境中需要实现正确的交易所逻辑，这里只是示例
          result = await transferToken(address, amount);
        } else if (tokenId === 'advancedtoken') {
          result = await transferAdvancedToken(address, amount);
        }
      } else {
        // 卖出代币：调用用户的转账函数
        if (tokenId === 'mytoken') {
          result = await transferToken(marketAddress, amount);
        } else if (tokenId === 'advancedtoken') {
          result = await transferAdvancedToken(marketAddress, amount);
        }
      }

      if (!result) {
        throw new Error("交易执行失败，未获得交易结果");
      }
      
      if (result.success) {
        setTradeResult({
          success: true,
          message: `${isBuy ? '买入' : '卖出'} ${amount} ${tokenSymbol} 成功！交易哈希: ${result.hash.substring(0, 10)}...`
        });
        setAmount('');
        setUsdValue('0');
        if (onTradeComplete) {
          onTradeComplete();
        }
      } else {
        setTradeResult({
          success: false,
          message: `${isBuy ? '买入' : '卖出'}失败: ${result.error || '交易被拒绝'}`
        });
      }
    } catch (error: any) {
      console.error('交易失败:', error);
      setTradeResult({
        success: false,
        message: `交易失败: ${error.message || '未知错误'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          {isBuy ? '买入' : '卖出'} {tokenSymbol}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">数量</Label>
            <Input
              id="amount"
              type="number"
              placeholder={`输入${isBuy ? '买入' : '卖出'}数量`}
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={isProcessing}
              min="0"
              step="0.01"
            />
            <p className="text-sm text-gray-500">
              估算价值: ${usdValue}
            </p>
          </div>

          <Button
            className={`w-full ${isBuy ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
            disabled={!isConnected || isProcessing || !amount || Number(amount) <= 0}
            onClick={handleTrade}
          >
            {isProcessing ? '处理中...' : `${isBuy ? '买入' : '卖出'} ${tokenSymbol}`}
          </Button>

          {tradeResult && (
            <div className={`p-3 mt-4 rounded-md ${
              tradeResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${
                tradeResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {tradeResult.message}
              </p>
            </div>
          )}

          <div className="pt-2 text-xs text-gray-500">
            <p>交易说明：</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>本应用是一个演示项目，使用真实部署的ERC20代币合约</li>
              <li>交易功能将调用实际的智能合约转账函数</li>
              <li>交易需要支付少量ETH作为gas费</li>
              <li>确保您的钱包中有足够的代币进行交易</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 