"use client";
import { useState, useEffect } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { MyTokenABI } from '@/lib/tokenContract';

export function TokenAdmin() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [deployedAddress, setDeployedAddress] = useState("");
  const [mounted, setMounted] = useState(false);
  const [redeploying, setRedeploying] = useState(false);
  const [tokenBytecode, setTokenBytecode] = useState("");

  // 获取账户信息
  const { address, isConnected } = useAccount();
  
  // 获取提供者和签名者
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  // 确保组件仅在客户端渲染
  useEffect(() => {
    setMounted(true);
    const tokenContractAddr = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
    if (tokenContractAddr && tokenContractAddr !== "0x0000000000000000000000000000000000000000") {
      setDeployedAddress(tokenContractAddr);
    }
    
    // 加载合约字节码
    fetch('/MyToken.json')
      .then(response => response.json())
      .then(data => {
        setTokenBytecode(data.bytecode);
      })
      .catch(error => {
        console.error('无法加载合约字节码:', error);
      });
  }, []);

  // 部署代币合约
  const handleDeployContract = async (isRedeploy = false) => {
    if (!signer) {
      setStatusMessage("请先连接钱包");
      return;
    }
    
    if (!tokenBytecode) {
      setStatusMessage("合约字节码加载失败，请刷新页面重试");
      return;
    }
    
    setIsDeploying(true);
    if (isRedeploy) {
      setRedeploying(true);
    }
    setStatusMessage("准备部署代币合约...");
    
    try {
      // 获取签名者地址
      const signerAddress = await signer.getAddress();
      
      // 设置初始发行量，这里是 100 万个代币（注意 18 位小数）
      const initialSupply = ethers.utils.parseUnits("1000000", 18);
      
      // 创建 MyToken 合约工厂，使用导入的ABI和字节码
      const TokenFactory = new ethers.ContractFactory(
        MyTokenABI,
        tokenBytecode,
        signer
      );
      
      // 部署合约
      setStatusMessage("部署代币合约中，请确认交易...");
      const token = await TokenFactory.deploy(initialSupply);
      
      // 等待部署完成
      await token.deployed();
      
      // 保存合约地址
      setDeployedAddress(token.address);
      
      // 提示用户设置环境变量
      setStatusMessage(`代币合约部署成功！请将以下地址设置为环境变量：NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${token.address}`);
    } catch (error: any) {
      console.error("代币合约部署失败:", error);
      setStatusMessage(`部署失败: ${error.message || "未知错误"}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRedeployContract = () => {
    handleDeployContract(true);
  };
  
  // 判断代币合约是否已部署
  const isDeployed = !!deployedAddress && deployedAddress !== "0x0000000000000000000000000000000000000000";
  
  // 如果未挂载，返回一个加载占位符
  if (!mounted) {
    return (
      <Card className="mb-2 border border-gray-200 shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-gray-100">
          <CardTitle className="text-base font-medium">代币合约部署</CardTitle>
        </CardHeader>
        <CardContent className="h-12 flex items-center justify-center py-2">
          <p className="text-gray-500">加载中...</p>
        </CardContent>
      </Card>
    );
  }
  
  // 如果代币合约已部署或重新部署中，显示已部署状态
  if (isDeployed || redeploying) {
    const displayAddress = redeploying && deployedAddress ? deployedAddress : deployedAddress;
    
    return (
      <Card className="mb-2 border border-gray-200 shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-gray-100 flex justify-between items-center">
          <CardTitle className="text-base font-medium">
            {redeploying ? "代币合约部署" : "代币合约已部署"}
          </CardTitle>
          {!isDeploying && !redeploying && (
            <Button
              onClick={handleRedeployContract}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              重新部署
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-3 px-4 pb-4">
          {!redeploying ? (
            <p className="text-sm text-gray-700 mb-3">
              代币合约已成功部署，可以使用代币功能。
            </p>
          ) : (
            <p className="text-sm text-gray-700 mb-3">
              {isDeploying ? "正在重新部署代币合约..." : "代币合约已重新部署，请使用新的合约地址。"}
            </p>
          )}
          
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-500">代币合约地址</p>
              {isDeploying && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">部署中</span>}
            </div>
            <p className="break-all font-mono text-xs text-gray-800">
              {displayAddress}
            </p>
          </div>
          
          {isDeploying && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">{statusMessage}</p>
            </div>
          )}
          
          {!isDeploying && statusMessage && statusMessage.includes("失败") && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-700">{statusMessage}</p>
            </div>
          )}
          
          {!isDeploying && !statusMessage.includes("失败") && statusMessage && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-700">{statusMessage}</p>
            </div>
          )}
          
          {/* <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-700">请将代币合约地址设置为环境变量：</p>
            <pre className="text-xs mt-1 bg-gray-800 text-white p-2 rounded overflow-x-auto">
              export NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS={displayAddress}
            </pre>
          </div> */}
        </CardContent>
      </Card>
    );
  }
  
  // 如果代币合约未部署，显示部署界面
  return (
    <Card className="mb-2 border border-gray-200 shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-gray-100">
        <CardTitle className="text-base font-medium">代币合约部署</CardTitle>
      </CardHeader>
      <CardContent className="pt-3 px-4 pb-4">
        {!isConnected ? (
          <Alert variant="destructive" className="py-2 bg-yellow-50 border border-yellow-200">
            <AlertTitle className="text-sm font-medium">未连接钱包</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              请先连接钱包以部署代币合约
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-3">
              您需要部署代币智能合约以使用代币功能。部署需要支付少量ETH用于燃料费。
            </p>
            
            <Button
              onClick={() => handleDeployContract()}
              disabled={isDeploying || !isConnected}
              className="w-full py-2 h-auto text-sm bg-blue-600 hover:bg-blue-700"
            >
              {isDeploying ? "部署中..." : "部署代币合约"}
            </Button>
            
            {statusMessage && (
              <div className={`mt-3 p-2 rounded-md border ${
                isDeploying ? "bg-blue-50 border-blue-200" : 
                statusMessage.includes("失败") ? "bg-red-50 border-red-200" : 
                "bg-green-50 border-green-200"
              }`}>
                <p className={`text-xs ${
                  isDeploying ? "text-blue-700" : 
                  statusMessage.includes("失败") ? "text-red-700" : 
                  "text-green-700"
                }`}>
                  {statusMessage}
                </p>
                
                {deployedAddress && !statusMessage.includes("失败") && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">代币合约地址</p>
                    <p className="break-all font-mono text-xs">
                      {deployedAddress}
                    </p>
                    <p className="text-xs mt-2 text-gray-700">
                      请将上述地址设置为环境变量 NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 