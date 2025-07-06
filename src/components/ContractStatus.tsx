"use client";
import { useState, useEffect } from 'react';
import { useProvider, useAccount } from 'wagmi';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getContractAddress, isContractDeployed, checkContractExists } from '@/lib/contractUtils';

export function ContractStatus() {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);
  
  const provider = useProvider();
  const { isConnected } = useAccount();
  
  // 确保组件仅在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 检查合约状态
  useEffect(() => {
    async function checkContract() {
      if (!mounted) return;
      
      setIsChecking(true);
      
      // 获取合约地址和部署状态
      const address = getContractAddress();
      const deployed = isContractDeployed();
      
      setContractAddress(address);
      setIsDeployed(deployed);
      
      // 如果配置表明合约已部署，则验证合约是否真的存在
      if (deployed && address !== "0x0000000000000000000000000000000000000000") {
        try {
          // 只有当钱包连接时才检查链上合约状态
          if (isConnected) {
            const exists = await checkContractExists(provider, address);
            setIsVerified(exists);
          } else {
            // 钱包未连接时，默认信任存储的部署状态
            setIsVerified(true);
          }
        } catch (error) {
          console.error("验证合约失败:", error);
          setIsVerified(false);
        }
      } else {
        setIsVerified(false);
      }
      
      setIsChecking(false);
    }
    
    if (mounted) {
      checkContract();
    }
  }, [provider, mounted, isConnected]); // 添加isConnected依赖，确保连接状态变化时重新检查
  
  // 如果未挂载或正在检查，显示加载状态
  if (!mounted || isChecking) {
    return (
      <div className="mb-3 p-2 bg-gray-50 rounded-md">
        正在检查合约状态...
      </div>
    );
  }
  
  // 如果合约未部署
  if (!isDeployed) {
    return (
      <div className="mb-3 p-2 bg-yellow-50 text-yellow-700 rounded-md">
        合约尚未部署。请使用上方的部署功能部署合约。
      </div>
    );
  }
  
  // 如果合约已部署但钱包未连接
  if (isDeployed && !isConnected) {
    return (
      <div className="mb-3 p-2 bg-blue-50 text-blue-700 rounded-md">
        合约已部署，请连接钱包以使用合约功能。
      </div>
    );
  }
  
  // 如果配置表明已部署但合约不存在
  if (isDeployed && isConnected && !isVerified) {
    return (
      <div className="mb-3 p-2 bg-red-50 text-red-700 rounded-md">
        配置显示合约已部署，但在区块链上未找到该合约。请检查网络连接或重新部署合约。
      </div>
    );
  }
  
  // 如果合约已部署且验证通过，不再显示重复信息
  if (isDeployed && isVerified) {
    return null;
  }
  
  return null;
} 