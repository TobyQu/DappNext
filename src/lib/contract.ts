import { ethers } from 'ethers';
import config from './config';

// 合约ABI
export const contractABI = [
  {
    "inputs": [],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "todoID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "NewTodo",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "todoID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "SendMoneyToContract",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTodoList",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "message",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct TodoContract.Todo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      }
    ],
    "name": "published",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "todoID",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "todoList",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// 从配置文件获取合约配置
export const CONTRACT_ADDRESS = config.contract.address;

// 定义Todo类型
export interface Todo {
  id: string;
  author: string;
  message: string;
  timestamp: string;
}

// 转换时间戳为日期格式
export function timestampToDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
}

/**
 * 获取以太坊提供者
 * @returns 以太坊提供者实例
 */
export const getProvider = async () => {
  try {
    // 浏览器环境
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.providers.Web3Provider(window.ethereum);
    }
    
    // 后端环境或无钱包
    return new ethers.providers.JsonRpcProvider('http://localhost:8545');
  } catch (error) {
    console.error('获取以太坊提供者时出错:', error);
    // 回退到本地 RPC
    return new ethers.providers.JsonRpcProvider('http://localhost:8545');
  }
};

/**
 * 获取签名者（已连接的钱包）
 * @returns 签名者实例
 */
export const getSigner = async () => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // 请求用户连接钱包
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (connectionError) {
        console.error('连接钱包时出错:', connectionError);
        throw new Error('用户拒绝连接钱包');
      }
      
      return provider.getSigner();
    }
    
    throw new Error('未检测到钱包扩展程序');
  } catch (error) {
    console.error('获取签名者时出错:', error);
    throw error;
  }
};

/**
 * 获取合约实例
 * @param provider 以太坊提供者
 * @param signer 签名者（可选）
 * @returns 合约实例
 */
export const getContract = (provider: any, signer: any = null) => {
  const contractInstance = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    provider
  );
  
  // 如果提供了签名者，返回具有写入权限的合约实例
  if (signer) {
    try {
      return contractInstance.connect(signer);
    } catch (error) {
      console.error('连接签名者失败:', error);
      return contractInstance;
    }
  }
  
  return contractInstance;
}; 