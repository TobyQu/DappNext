import { ethers } from 'ethers';
import { contractABI, CONTRACT_ADDRESS } from './contract';
import config from './config';

// 合约字节码 - 由Hardhat编译后生成
// 实际应用中，可以通过构建脚本自动更新这个值
export const CONTRACT_BYTECODE = "0x608060405260008055600160405160808101604052603f8060116000396000f3fe608060405200fca165627a7a72305820c98643943ea51a8baa5d8f4358d18a7804c14ada6376bc42e5e06357b87f2cd30029";

/**
 * 从本地存储获取合约地址
 * 优先级：本地存储 > 环境变量
 */
export function getContractAddress(): string {
  if (typeof window !== 'undefined') {
    const localAddress = localStorage.getItem('CONTRACT_ADDRESS');
    if (localAddress && localAddress !== "0x0000000000000000000000000000000000000000") {
      return localAddress;
    }
  }
  
  return CONTRACT_ADDRESS;
}

/**
 * 从本地存储获取合约部署状态
 * 优先级：本地存储 > 环境变量
 */
export function isContractDeployed(): boolean {
  if (typeof window !== 'undefined') {
    const isDeployed = localStorage.getItem('IS_CONTRACT_DEPLOYED');
    if (isDeployed) {
      return isDeployed === 'true';
    }
  }
  
  return config.contract.isDeployed;
}

/**
 * 部署合约
 * @param signer 签名者
 * @param value 发送的ETH金额
 * @returns 部署后的合约实例
 */
export async function deployContract(signer: ethers.Signer, value: string = "0.1"): Promise<ethers.Contract> {
  // 创建合约工厂
  const factory = new ethers.ContractFactory(contractABI, CONTRACT_BYTECODE, signer);
  
  // 部署合约
  const contract = await factory.deploy({ 
    value: ethers.utils.parseEther(value) 
  });
  
  // 等待部署完成
  await contract.deployed();
  
  // 存储合约地址
  if (typeof window !== 'undefined') {
    localStorage.setItem('CONTRACT_ADDRESS', contract.address);
    localStorage.setItem('IS_CONTRACT_DEPLOYED', 'true');
  }
  
  return contract;
}

/**
 * 检查合约是否存在于区块链上
 * @param provider 提供者
 * @param address 合约地址
 * @returns 合约是否存在
 */
export async function checkContractExists(provider: ethers.providers.Provider, address: string): Promise<boolean> {
  try {
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    console.error('检查合约存在出错:', error);
    return false;
  }
} 