"use client";
import { useState, useEffect } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import { Alert, AlertDescription } from "@/components/ui/alert";

import { TodoHeader } from '@/components/TodoHeader';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { Todo as TodoType, getContract } from '@/lib/contract';
import { isContractDeployed } from '@/lib/contractUtils';





export function Todo() {
  const [todoList, setTodoList] = useState<TodoType[]>([]);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // 获取账户信息
  const { address, isConnected } = useAccount();
  
  // 获取提供者和签名者
  const provider = useProvider();
  const { data: signer } = useSigner();

  // 确保组件已挂载（仅客户端渲染）
  useEffect(() => {
    setMounted(true);
  }, []);

  // 初始化合约
  useEffect(() => {
    if (mounted) {
      const contractInstance = getContract(provider, signer);
      setContract(contractInstance);
    }
  }, [mounted, signer, provider]);

  // 获取余额
  const getBalance = async () => {
    if (!contract || !isContractDeployed()) {
      setStatusMessage('合约未部署或初始化');
      return;
    }

    try {
      const result = await contract.getBalance();
      setBalance(ethers.utils.formatEther(result));
      setStatusMessage('');
    } catch (error) {
      console.error('获取余额失败:', error);
      setStatusMessage('获取余额失败');
    }
  };

  // 获取消息列表
  const getTodoList = async () => {
    if (!contract || !isContractDeployed()) {
      setStatusMessage('合约未部署或初始化');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await contract.getTodoList();
      const formattedList = result.map((item: any) => ({
        id: item.id.toString(),
        author: item.author,
        message: item.message,
        timestamp: item.timestamp.toString(),
      }));
      
      // 按时间戳降序排序
      setTodoList(formattedList.sort((a: TodoType, b: TodoType) => 
        parseInt(b.timestamp) - parseInt(a.timestamp)
      ));
      setStatusMessage('');
    } catch (error) {
      console.error('获取消息列表失败:', error);
      setStatusMessage('获取消息列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 发布消息
  const publishMessage = async (message: string) => {
    if (!contract || !signer || !message || !isContractDeployed()) {
      setStatusMessage('合约未部署或初始化');
      return;
    }
    
    setIsLoading(true);
    try {
      // 发送0.1 ETH
      const tx = await contract.published(message, {
        value: ethers.utils.parseEther('0.1')
      });
      
      setStatusMessage('交易已提交，等待确认...');
      await tx.wait();
      setStatusMessage('消息发布成功');
      
      // 刷新数据
      getTodoList();
      getBalance();
    } catch (error) {
      console.error('发布消息失败:', error);
      setStatusMessage('发布消息失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 提款
  const withdraw = async () => {
    if (!contract || !signer || !isContractDeployed()) {
      setStatusMessage('合约未部署或初始化');
      return;
    }
    
    setIsWithdrawing(true);
    try {
      const tx = await contract.withdraw();
      setStatusMessage('提款交易已提交，等待确认...');
      await tx.wait();
      setStatusMessage('提款成功');
      
      // 刷新余额
      getBalance();
    } catch (error) {
      console.error('提款失败:', error);
      setStatusMessage('提款失败');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // 页面加载或账户变更时获取数据
  useEffect(() => {
    if (mounted && isConnected && contract && isContractDeployed()) {
      getBalance();
      getTodoList();
    }
  }, [mounted, isConnected, address, contract]);

  // 如果组件未挂载，返回加载中占位符，避免水合错误
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-8 text-center text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TodoHeader 
        balance={balance}
        isConnected={isConnected}
        isContractDeployed={isContractDeployed()}
        getBalance={getBalance}
        withdraw={withdraw}
        isWithdrawing={isWithdrawing}
      />

      <TodoForm 
        isConnected={isConnected}
        isContractDeployed={isContractDeployed()}
        isLoading={isLoading}
        publishMessage={publishMessage}
      />

      {statusMessage && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
          {statusMessage}
        </div>
      )}

      <TodoList 
        todoList={todoList}
        isLoading={isLoading}
        isContractDeployed={isContractDeployed()}
        refreshList={getTodoList}
      />
    </div>
  );
} 