import { ethers } from 'ethers';
import config, { isValidContractAddress } from './config';

// MyToken合约ABI
export const MyTokenABI = [
  "constructor(uint256 initialSupply)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// 检查是否在浏览器环境中，并且window.ethereum是否存在
const isEthereumAvailable = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// 获取连接到合约的方法
export function getTokenContract(provider?: any, contractAddress?: string) {
  const tokenAddress = contractAddress || config.contract.tokenAddress;
  if (!isValidContractAddress(tokenAddress)) {
    // 不输出错误日志，只是安静地返回null
    return null;
  }
  
  try {
    // 如果没有传递provider，尝试创建默认provider
    let contractProvider = provider;
    if (!contractProvider) {
      if (isEthereumAvailable()) {
        contractProvider = new ethers.providers.Web3Provider(window.ethereum as any);
      } else {
        // 如果不在浏览器环境中，使用默认的JSON RPC提供者
        contractProvider = new ethers.providers.JsonRpcProvider();
      }
    }
    
    // 创建合约实例
    const contract = new ethers.Contract(tokenAddress, MyTokenABI, contractProvider);
    return contract;
  } catch (error) {
    console.error("创建合约实例失败:", error);
    return null;
  }
}

// 获取用于写入操作的合约
export function getTokenContractWithSigner(signer?: any, contractAddress?: string) {
  const tokenAddress = contractAddress || config.contract.tokenAddress;
  if (!isValidContractAddress(tokenAddress)) {
    // 不输出错误日志，只是安静地返回null
    return null;
  }
  
  try {
    // 如果没有传递signer，尝试创建默认signer
    let contractSigner = signer;
    if (!contractSigner) {
      if (isEthereumAvailable()) {
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        contractSigner = provider.getSigner();
      } else {
        throw new Error("无法获取签名者，浏览器不支持以太坊或未安装钱包");
      }
    }
    
    // 创建合约实例
    const contract = new ethers.Contract(tokenAddress, MyTokenABI, contractSigner);
    return contract;
  } catch (error) {
    console.error("创建带签名者的合约实例失败:", error);
    return null;
  }
}

/**
 * 查询指定地址的代币余额
 * @param address 要查询的地址
 * @returns 代币余额（格式化后的字符串，如 "100.0"）
 */
export const getTokenBalance = async (address: string) => {
  try {
    const contract = getTokenContract();
    if (!contract) {
      throw new Error("无法获取合约实例");
    }
    
    const balance = await contract.balanceOf(address);
    // 将 wei 转换为以太单位（考虑到代币的小数位可能是 18）
    return ethers.utils.formatUnits(balance, 18);
  } catch (error) {
    console.error("获取代币余额失败:", error);
    return "0.0";
  }
};

/**
 * 转账代币给指定地址
 * @param to 接收地址
 * @param amount 转账金额（如 "10.5"，会自动转换为 wei 单位）
 * @returns 交易结果
 */
export const transferToken = async (to: string, amount: string) => {
  try {
    const contract = getTokenContractWithSigner();
    if (!contract) {
      throw new Error("无法获取合约实例");
    }
    
    // 将以太单位转换为 wei（考虑到代币的小数位可能是 18）
    const amountInWei = ethers.utils.parseUnits(amount, 18);
    
    // 发送交易
    const tx = await contract.transfer(to, amountInWei);
    // 等待交易被确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.transactionHash
    };
  } catch (error: any) {
    console.error("代币转账失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 授权其他地址使用自己的代币
 * @param spender 被授权的地址
 * @param amount 授权金额（如 "10.5"，会自动转换为 wei 单位）
 * @returns 交易结果
 */
export const approveToken = async (spender: string, amount: string) => {
  try {
    const contract = getTokenContractWithSigner();
    if (!contract) {
      throw new Error("无法获取合约实例");
    }
    
    // 将以太单位转换为 wei
    const amountInWei = ethers.utils.parseUnits(amount, 18);
    
    // 发送授权交易
    const tx = await contract.approve(spender, amountInWei);
    // 等待交易被确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.transactionHash
    };
  } catch (error: any) {
    console.error("代币授权失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取代币信息
 * @returns 代币的名称、符号、小数位数和总供应量
 */
export const getTokenInfo = async () => {
  try {
    const contract = getTokenContract();
    if (!contract) {
      // 合约未部署，返回默认值，但不抛出错误
      return {
        name: "Unknown",
        symbol: "???",
        decimals: 18,
        totalSupply: "0",
        error: "合约未部署或地址无效"
      };
    }
    
    // 检查合约是否正常响应
    try {
      // 先尝试调用 name() 方法检查合约是否可用
      await contract.name();
    } catch (error: any) {
      // 合约调用失败，但不输出错误日志
      return {
        name: "Unknown",
        symbol: "???",
        decimals: 18,
        totalSupply: "0",
        error: "合约调用失败，可能是合约地址错误或合约未部署"
      };
    }
    
    // 获取各个信息，并处理每个调用的错误
    try {
      // 并行获取多个信息
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);
      
      return {
        name,
        symbol,
        decimals,
        // 格式化总供应量
        totalSupply: ethers.utils.formatUnits(totalSupply, decimals)
      };
    } catch (error: any) {
      // 不输出错误日志，返回默认值
      return {
        name: "Unknown",
        symbol: "???",
        decimals: 18,
        totalSupply: "0",
        error: "无法读取合约数据，请确认合约已正确部署"
      };
    }
  } catch (error: any) {
    // 不输出错误日志，返回默认值
    return {
      name: "Unknown",
      symbol: "???",
      decimals: 18,
      totalSupply: "0",
      error: error.message || "未知错误"
    };
  }
}; 