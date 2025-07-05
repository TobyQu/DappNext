"use client";
import { useState, useEffect } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <div className="border rounded-md p-3 mb-4 bg-white shadow-none">
        <h2 className="text-lg font-semibold mb-2">合约部署</h2>
        <div className="h-16 flex items-center justify-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }
  
  // 如果合约已部署，显示已部署状态
  if (isDeployed && contractAddress !== "0x0000000000000000000000000000000000000000") {
    return (
      <div className="border rounded-md p-3 mb-3 bg-green-50 shadow-none">
        <h2 className="text-lg font-semibold mb-1">合约已部署</h2>
        <p className="mb-2 text-gray-600">
          合约已成功部署，可以使用下方功能。
        </p>
        <div className="mt-1 p-2 bg-gray-50 rounded border text-sm break-all">
          <span className="font-medium">合约地址: </span>
          {contractAddress}
        </div>
      </div>
    );
  }
  
  // 如果合约未部署，显示部署界面
  return (
    <div className="border rounded-md p-3 mb-3 bg-white shadow-none">
      <h2 className="text-lg font-semibold mb-2">合约部署</h2>
      
      {!isConnected ? (
        <div className="p-2 mb-2 bg-yellow-50 text-yellow-700 rounded-md">
          请先连接钱包以部署合约
        </div>
      ) : (
        <>
          <p className="mb-3 text-gray-600">
            您需要部署智能合约以使用Todo DApp功能。部署需要支付少量ETH用于燃料费。
          </p>
          
          <Button
            onClick={handleDeployContract}
            disabled={isDeploying || !isConnected}
            className="w-full mb-2"
          >
            {isDeploying ? "部署中..." : "部署合约"}
          </Button>
          
          {statusMessage && (
            <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded-md">
              {statusMessage}
            </div>
          )}
          
          {deployedAddress && (
            <div className="mt-2 p-2 bg-gray-50 rounded border text-sm break-all">
              <span className="font-medium">合约地址: </span>
              {deployedAddress}
            </div>
          )}
        </>
      )}
    </div>
  );
}

 