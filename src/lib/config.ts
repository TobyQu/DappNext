// 应用配置
const config = {
  // 合约配置
  contract: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    isDeployed: process.env.NEXT_PUBLIC_IS_CONTRACT_DEPLOYED === "true",
  },
  
  // 网络配置
  network: {
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "1", // 默认以太坊主网
    name: process.env.NEXT_PUBLIC_NETWORK_NAME || "Ethereum Mainnet",
  },
  
  // 应用设置
  app: {
    name: "DApp Todo",
    version: "1.0.0",
  }
};

export default config; 