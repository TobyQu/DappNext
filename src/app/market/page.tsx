'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTokenInfo } from '@/lib/tokenContract';
import { getAdvancedTokenInfo } from '@/lib/advancedTokenContract';
import TokenTrading from '@/components/TokenTrading';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// 代币市场数据类型
interface TokenMarketData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  totalSupply: string;
  contractDeployed: boolean;
  contractAddress?: string;
  decimals: number;
  chart: number[]; // 简化的价格历史数据
}

// 虚拟市场页面组件
export default function MarketPage() {
  const { isConnected } = useAccount();
  const [tokens, setTokens] = useState<TokenMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<TokenMarketData | null>(null);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [error, setError] = useState<string | null>(null);

  // 生成随机波动的价格历史 (仅用于图表显示)
  const generatePriceHistory = (basePrice: number, points: number = 24) => {
    const history = [];
    let price = basePrice;
    for (let i = 0; i < points; i++) {
      // 在基准价格的 ±5% 范围内随机波动
      const change = basePrice * (Math.random() * 0.1 - 0.05);
      price += change;
      price = Math.max(price, basePrice * 0.8); // 确保价格不会太低
      history.push(price);
    }
    return history;
  };

  // 获取代币信息
  useEffect(() => {
    const fetchTokensData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 尝试获取基本代币信息
        let basicTokenInfo;
        let advancedTokenInfo;
        let marketData: TokenMarketData[] = [];
        
        try {
          basicTokenInfo = await getTokenInfo();
          
          // 检查是否成功获取代币信息
          if (basicTokenInfo && basicTokenInfo.name && basicTokenInfo.name !== "Unknown") {
            const tokenPrice = 0.05; // 假设价格为固定值，实际项目中可对接价格预言机
            marketData.push({
              id: 'mytoken',
              name: basicTokenInfo.name,
              symbol: basicTokenInfo.symbol,
              price: tokenPrice,
              priceChange24h: 0, // 实际项目中需要通过历史数据计算
              volume24h: 0, // 实际项目中需要跟踪交易量
              marketCap: parseFloat(basicTokenInfo.totalSupply) * tokenPrice,
              totalSupply: basicTokenInfo.totalSupply,
              contractDeployed: true,
              contractAddress: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS,
              decimals: basicTokenInfo.decimals,
              chart: generatePriceHistory(tokenPrice) // 仅作为UI展示
            });
          }
        } catch (error) {
          console.log('基础代币合约未部署或访问失败:', error);
        }
        
        try {
          advancedTokenInfo = await getAdvancedTokenInfo();
          
          // 检查是否成功获取高级代币信息
          if (advancedTokenInfo && advancedTokenInfo.name && advancedTokenInfo.name !== "Unknown") {
            const advTokenPrice = 0.08; // 假设价格为固定值
            marketData.push({
              id: 'advancedtoken',
              name: advancedTokenInfo.name,
              symbol: advancedTokenInfo.symbol,
              price: advTokenPrice,
              priceChange24h: 0,
              volume24h: 0,
              marketCap: parseFloat(advancedTokenInfo.totalSupply) * advTokenPrice,
              totalSupply: advancedTokenInfo.totalSupply,
              contractDeployed: true,
              contractAddress: process.env.NEXT_PUBLIC_ADVANCED_TOKEN_CONTRACT_ADDRESS,
              decimals: advancedTokenInfo.decimals,
              chart: generatePriceHistory(advTokenPrice)
            });
          }
        } catch (error) {
          console.log('高级代币合约未部署或访问失败:', error);
        }

        // 如果没有检测到已部署的代币，显示提示
        if (marketData.length === 0) {
          setError('未检测到已部署的代币合约，请先在"代币"或"高级代币"页面部署合约');
        }

        setTokens(marketData);
        if (marketData.length > 0) {
          setSelectedToken(marketData[0]);
        }
      } catch (error) {
        console.error('获取代币市场数据失败:', error);
        setError('获取代币市场数据失败，请检查钱包连接和网络状态');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokensData();
  }, []);

  // 格式化数字为货币格式
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  // 处理交易对话框
  const handleTradeButtonClick = (type: 'buy' | 'sell') => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }
    setTradeType(type);
    setShowTradeDialog(true);
  };

  // 交易完成后的回调
  const handleTradeComplete = () => {
    setTimeout(() => {
      setShowTradeDialog(false);
    }, 2000);
  };

  // 简化的迷你图表组件
  const MiniChart = ({ data, positive }: { data: number[], positive: boolean }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    return (
      <div className="h-12 w-full flex items-end">
        {data.map((value, index) => {
          const height = range ? ((value - min) / range) * 100 : 50;
          return (
            <div 
              key={index} 
              className={`w-1 mx-0.5 rounded-t ${positive ? 'bg-green-500' : 'bg-red-500'}`} 
              style={{ height: `${Math.max(10, height)}%` }}
            ></div>
          );
        })}
      </div>
    );
  };

  // 代币详情卡片
  const TokenDetailCard = ({ token }: { token: TokenMarketData }) => {
    if (!token) return null;
    
    const isPositive = token.priceChange24h >= 0;

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <span>{token.name} ({token.symbol})</span>
            <span className="text-2xl font-bold">${token.price.toFixed(token.price < 1 ? 4 : 2)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <p className="text-sm text-gray-500">合约地址</p>
            <p className="text-xs font-mono break-all">{token.contractAddress || '未知'}</p>
          </div>
          
          <div className="flex justify-between mb-4">
            <span className="text-sm text-gray-500">24h 涨跌幅</span>
            <span className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}%
            </span>
          </div>
          
          <div className="h-40 mb-6 border border-gray-200 rounded-lg p-2">
            <MiniChart data={token.chart} positive={isPositive} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">24h 交易量</p>
              <p className="font-bold">{formatCurrency(token.volume24h)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">市值</p>
              <p className="font-bold">{formatCurrency(token.marketCap)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">总供应量</p>
              <p className="font-bold">{parseInt(token.totalSupply).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">精度</p>
              <p className="font-bold">{token.decimals}</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button 
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => handleTradeButtonClick('buy')}
            >
              买入
            </Button>
            <Button 
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={() => handleTradeButtonClick('sell')}
            >
              卖出
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">代币市场</h1>
      
      {isLoading ? (
        <div className="text-center py-8">正在加载市场数据...</div>
      ) : error ? (
        <div className="text-center py-8 px-4 max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-red-500 mb-4">⚠️ {error}</div>
              <p className="text-sm text-gray-600 mb-4">
                请前往"代币"或"高级代币"页面部署智能合约后再访问市场
              </p>
              <div className="flex space-x-4 justify-center">
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => window.location.href = '/token'}
                >
                  前往代币页面
                </Button>
                <Button
                  className="bg-purple-500 hover:bg-purple-600"
                  onClick={() => window.location.href = '/advanced-token'}
                >
                  前往高级代币页面
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : tokens.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {selectedToken && <TokenDetailCard token={selectedToken} />}
          </div>
          
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">市场行情</h2>
            <div className="space-y-4">
              {tokens.map(token => (
                <Card 
                  key={token.id} 
                  className={`cursor-pointer ${selectedToken?.id === token.id ? 'border-blue-500 shadow-lg' : ''}`}
                  onClick={() => setSelectedToken(token)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{token.symbol}</h3>
                        <p className="text-sm text-gray-500">{token.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${token.price.toFixed(token.price < 1 ? 4 : 2)}</p>
                        <p className={`text-sm ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          未找到任何代币数据，请先部署代币合约
        </div>
      )}

      {/* 交易对话框 */}
      <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tradeType === 'buy' ? '买入' : '卖出'} {selectedToken?.symbol}
            </DialogTitle>
          </DialogHeader>
          {selectedToken && (
            <TokenTrading 
              tokenId={selectedToken.id}
              tokenSymbol={selectedToken.symbol}
              tokenPrice={selectedToken.price}
              isBuy={tradeType === 'buy'}
              onTradeComplete={handleTradeComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 