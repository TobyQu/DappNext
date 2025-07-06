"use client";
import { useState, useEffect } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { contractABI } from '@/lib/contract';
import { deployContract, CONTRACT_BYTECODE, isContractDeployed, getContractAddress } from '@/lib/contractUtils';

export function DeployContract() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [deployedAddress, setDeployedAddress] = useState("");
  const [mounted, setMounted] = useState(false);

  // 获取账户信息
  const { address, isConnected } = useAccount();
  
  // 获取提供者和签名者
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  // 确保组件仅在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  // 部署合约
  const handleDeployContract = async () => {
    if (!signer) {
      setStatusMessage("请先连接钱包");
      return;
    }
    
    setIsDeploying(true);
    setStatusMessage("准备部署合约...");
    
    try {
      // 部署合约，发送0.1 ETH
      setStatusMessage("部署合约中，请确认交易...");
      const contract = await deployContract(signer, "0.1");
      
      // 保存合约地址
      setDeployedAddress(contract.address);
      setStatusMessage(`合约部署成功！地址: ${contract.address}`);
      
      // 提示用户刷新页面
      setTimeout(() => {
        setStatusMessage("合约已部署，请刷新页面以使用新合约。");
      }, 3000);
    } catch (error: any) {
      console.error("部署失败:", error);
      setStatusMessage(`部署失败: ${error.message || "未知错误"}`);
    } finally {
      setIsDeploying(false);
    }
  };

  // 导入合约工具
  const isDeployed = isContractDeployed();
  const contractAddress = getContractAddress();
  
  // 如果未挂载，返回一个加载占位符
  if (!mounted) {
    return (
      <Card className="mb-2">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-base">合约部署</CardTitle>
        </CardHeader>
        <CardContent className="h-12 flex items-center justify-center py-1">
          <p className="text-gray-500">加载中...</p>
        </CardContent>
      </Card>
    );
  }
  
  // 如果合约已部署，显示已部署状态
  if (isDeployed && contractAddress !== "0x0000000000000000000000000000000000000000") {
    return (
      <Card className="bg-green-50 mb-2">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-base">合约已部署</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <p className="text-sm text-gray-600">
            合约已成功部署，可以使用下方功能。
          </p>
          <Alert className="bg-gray-50 mt-2 py-1">
            <AlertTitle className="text-xs font-medium">合约地址</AlertTitle>
            <AlertDescription className="break-all font-mono text-xs">
              {contractAddress}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // 如果合约未部署，显示部署界面
  return (
    <Card className="mb-2">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-base">合约部署</CardTitle>
      </CardHeader>
      <CardContent className="pt-1 px-3 pb-3">
        {!isConnected ? (
          <Alert variant="destructive" className="py-1 bg-yellow-50">
            <AlertTitle className="text-xs font-medium">未连接钱包</AlertTitle>
            <AlertDescription className="text-xs">
              请先连接钱包以部署合约
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-2">
              您需要部署智能合约以使用Todo DApp功能。部署需要支付少量ETH用于燃料费。
            </p>
            
            <Button
              onClick={handleDeployContract}
              disabled={isDeploying || !isConnected}
              className="w-full py-1 h-auto text-sm"
            >
              {isDeploying ? "部署中..." : "部署合约"}
            </Button>
            
            {(statusMessage || deployedAddress) && (
              <Alert className={`mt-2 py-1 ${isDeploying ? "bg-blue-50" : statusMessage.includes("失败") ? "bg-red-50" : "bg-green-50"}`}>
                {statusMessage && (
                  <>
                    <AlertTitle className="text-xs font-medium">{isDeploying ? "处理中" : statusMessage.includes("失败") ? "错误" : "成功"}</AlertTitle>
                    <AlertDescription className="text-xs">{statusMessage}</AlertDescription>
                  </>
                )}
                {deployedAddress && (
                  <>
                    <AlertTitle className="text-xs font-medium">合约地址</AlertTitle>
                    <AlertDescription className="break-all font-mono text-xs">
                      {deployedAddress}
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

 