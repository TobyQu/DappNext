/**
 * 应用配置文件
 * 集中管理所有环境变量和配置信息
 */

// 应用配置
const config = {
  // 合约配置
  contract: {
    // 主合约地址（Todo合约）
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    isDeployed: process.env.NEXT_PUBLIC_IS_CONTRACT_DEPLOYED === "true",
    
    // 代币合约地址
    tokenAddress: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    
    // 高级代币合约地址
    advancedTokenAddress: process.env.NEXT_PUBLIC_ADVANCED_TOKEN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    
    // 市场地址
    marketAddress: process.env.NEXT_PUBLIC_MARKET_ADDRESS || "0x63ba358021968212f1C91d8a1A8090aC25b528d6"
  },
  
  // 网络配置
  network: {
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337"),
    name: process.env.NEXT_PUBLIC_NETWORK_NAME || "Hardhat",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
  },
  
  // 应用设置
  app: {
    name: "DappNext",
    version: "1.0.0",
  }
};

export default config;

/**
 * 检查地址是否为有效的以太坊地址
 * @param address 要检查的地址
 * @returns 是否有效
 */
export function isValidContractAddress(address?: string): boolean {
  if (!address) return false;
  if (address === "0x0000000000000000000000000000000000000000") return false;
  // 简单检查是否符合以太坊地址格式
  return /^0x[a-fA-F0-9]{40}$/.test(address);
} 