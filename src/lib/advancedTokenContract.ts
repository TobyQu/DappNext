import { ethers } from 'ethers';
import { getProvider, getSigner } from './contract';
import config, { isValidContractAddress } from './config';

// 导入高级代币合约 ABI
// 注意：部署后需要将 artifacts/contracts/AdvancedToken.sol/AdvancedToken.json 中的 abi 复制到这里
// 或者使用 require() 直接导入
const advancedTokenAbi = [
  // 查询余额方法
  "function balanceOf(address owner) view returns (uint256)",
  // 代币转账方法
  "function transfer(address to, uint256 amount) returns (bool)",
  // 授权方法
  "function approve(address spender, uint256 amount) returns (bool)",
  // 授权转账方法
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  // 查询授权额度方法
  "function allowance(address owner, address spender) view returns (uint256)",
  // 查询代币信息
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  // 高级代币特有方法
  "function maxSupply() view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
  "function setMaxSupply(uint256 newMaxSupply)",
  "function owner() view returns (address)",
  // 事件
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount)",
  "event TokensBurned(address indexed from, uint256 amount)"
];

// 部署后的高级代币合约地址（需要在部署后更新）
// 从环境变量中获取
const ADVANCED_TOKEN_CONTRACT_ADDRESS = config.contract.advancedTokenAddress;

/**
 * 获取高级代币合约实例
 * @returns 高级代币合约实例，如果合约未部署则返回null
 */
export const getAdvancedTokenContract = async () => {
  const provider = await getProvider();
  const contractAddress = config.contract.advancedTokenAddress;
  
  if (!isValidContractAddress(contractAddress)) {
    // 不输出错误日志，只是安静地返回null
    return null;
  }
  
  return new ethers.Contract(contractAddress, advancedTokenAbi, provider);
};

/**
 * 获取可写的高级代币合约实例（需要连接钱包）
 * @returns 可写的高级代币合约实例，如果合约未部署则返回null
 */
export const getAdvancedTokenContractWithSigner = async () => {
  const signer = await getSigner();
  const contractAddress = config.contract.advancedTokenAddress;
  
  if (!isValidContractAddress(contractAddress)) {
    // 不输出错误日志，只是安静地返回null
    return null;
  }
  
  return new ethers.Contract(contractAddress, advancedTokenAbi, signer);
};

/**
 * 查询指定地址的代币余额
 * @param address 要查询的地址
 * @returns 代币余额（格式化后的字符串）
 */
export const getAdvancedTokenBalance = async (address: string) => {
  try {
    const contract = await getAdvancedTokenContract();
    if (!contract) {
      throw new Error("无法获取合约实例");
    }
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error: any) { // 确保error类型为any
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
export const transferAdvancedToken = async (to: string, amount: string) => {
  try {
    const contract = await getAdvancedTokenContractWithSigner();
    if (!contract) {
      throw new Error("无法获取合约实例");
    }
    const decimals = await contract.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    const tx = await contract.transfer(to, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.transactionHash
    };
  } catch (error: any) { // 确保error类型为any
    console.error("代币转账失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 铸造新代币（只有合约所有者可以调用）
 * @param to 接收新代币的地址
 * @param amount 铸造的代币数量（如 "10.5"，会自动转换为 wei 单位）
 * @returns 交易结果
 */
export const mintAdvancedToken = async (to: string, amount: string) => {
  try {
    const contract = await getAdvancedTokenContractWithSigner();
    if (!contract) {
      throw new Error("无法获取合约实例");
    }
    const decimals = await contract.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    const tx = await contract.mint(to, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.transactionHash
    };
  } catch (error: any) { // 确保error类型为any
    console.error("铸造代币失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 销毁自己的代币
 * @param amount 要销毁的代币数量（如 "10.5"，会自动转换为 wei 单位）
 * @returns 交易结果
 */
export const burnAdvancedToken = async (amount: string) => {
  try {
    const contract = await getAdvancedTokenContractWithSigner();
    if (!contract) {
      throw new Error("无法获取合约实例");
    }
    const decimals = await contract.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    const tx = await contract.burn(amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.transactionHash
    };
  } catch (error: any) { // 确保error类型为any
    console.error("销毁代币失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 从指定地址销毁代币（需要事先获得授权）
 * @param account 要从中销毁代币的地址
 * @param amount 要销毁的代币数量（如 "10.5"，会自动转换为 wei 单位）
 * @returns 交易结果
 */
export const burnFromAdvancedToken = async (account: string, amount: string) => {
  try {
    const contract = await getAdvancedTokenContractWithSigner();
    if (!contract) {
      throw new Error("无法获取合约实例");
    }
    const decimals = await contract.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    const tx = await contract.burnFrom(account, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.transactionHash
    };
  } catch (error: any) { // 确保error类型为any
    console.error("从指定地址销毁代币失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 设置最大供应量（只有合约所有者可以调用）
 * @param newMaxSupply 新的最大供应量（如 "10000000"，会自动转换为 wei 单位）
 * @returns 交易结果
 */
export const setMaxSupply = async (newMaxSupply: string) => {
  try {
    const contract = await getAdvancedTokenContractWithSigner();
    if (!contract) {
      throw new Error("无法获取合约实例");
    }
    const decimals = await contract.decimals();
    const amountInWei = ethers.utils.parseUnits(newMaxSupply, decimals);
    
    const tx = await contract.setMaxSupply(amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.transactionHash
    };
  } catch (error: any) { // 确保error类型为any
    console.error("设置最大供应量失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取代币详细信息
 * @returns 代币的名称、符号、小数位数、总供应量、最大供应量和所有者地址
 */
export const getAdvancedTokenInfo = async () => {
  try {
    const contract = await getAdvancedTokenContract();
    if (!contract) {
      // 合约未部署，返回默认值，但不抛出错误
      return {
        name: "Unknown",
        symbol: "???",
        decimals: 18,
        totalSupply: "0",
        maxSupply: "0",
        owner: "0x0000000000000000000000000000000000000000",
        error: "合约未部署或地址无效"
      };
    }
    
    // 检查合约是否正常响应
    try {
      // 先尝试调用 name() 方法检查合约是否可用
      await contract.name();
    } catch (error: any) {
      console.error("合约调用失败:", error);
      return {
        name: "Unknown",
        symbol: "???",
        decimals: 18,
        totalSupply: "0",
        maxSupply: "0",
        owner: "0x0000000000000000000000000000000000000000",
        error: "合约调用失败，可能是合约地址错误或合约未部署"
      };
    }
    
    // 获取各个信息，并处理每个调用的错误
    try {
      // 并行获取多个信息
      const [name, symbol, decimals, totalSupply, maxSupply, owner] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
        contract.maxSupply(),
        contract.owner()
      ]);
      
      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
        maxSupply: ethers.utils.formatUnits(maxSupply, decimals),
        owner
      };
    } catch (error: any) {
      console.error("获取高级代币数据失败:", error);
      return {
        name: "Unknown",
        symbol: "???",
        decimals: 18,
        totalSupply: "0",
        maxSupply: "0",
        owner: "0x0000000000000000000000000000000000000000",
        error: "无法读取合约数据，请确认合约已正确部署"
      };
    }
  } catch (error: any) {
    console.error("获取高级代币信息失败:", error);
    // 返回默认值，但清晰地表明这些是无效数据
    return {
      name: "Unknown",
      symbol: "???",
      decimals: 18,
      totalSupply: "0",
      maxSupply: "0",
      owner: "0x0000000000000000000000000000000000000000",
      error: error.message || "未知错误"
    };
  }
};

/**
 * 检查当前连接的地址是否为合约所有者
 * @returns 是否为所有者
 */
export const isTokenOwner = async () => {
  try {
    const contract = await getAdvancedTokenContract();
    if (!contract) {
      return false; // 如果合约未部署，直接返回false
    }
    
    try {
      const signer = await getSigner();
      const owner = await contract.owner();
      
      return owner.toLowerCase() === (await signer.getAddress()).toLowerCase();
    } catch (error: any) {
      console.error("检查所有者时遇到错误:", error);
      return false;
    }
  } catch (error: any) {
    console.error("检查所有者失败:", error);
    return false;
  }
}; 