"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TodoHeaderProps {
  balance: string;
  isConnected: boolean;
  isContractDeployed: boolean;
  getBalance: () => Promise<void>;
  withdraw: () => Promise<void>;
  isWithdrawing: boolean;
}

export function TodoHeader({
  balance,
  isConnected,
  isContractDeployed,
  getBalance,
  withdraw,
  isWithdrawing
}: TodoHeaderProps) {
  return (
    <>
      {!isContractDeployed && (
        <Alert className="mb-8 bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertDescription>
            <h2 className="text-xl font-semibold text-yellow-800">演示模式</h2>
            <p className="mt-2">
              当前处于演示模式，未连接实际部署的合约。要使用完整功能，请部署合约并更新代码中的CONTRACT_ADDRESS变量，然后将IS_CONTRACT_DEPLOYED设置为true。
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>合约账户余额: {balance} ETH</span>
            <Badge variant="outline">{isConnected ? "已连接" : "未连接"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              onClick={getBalance}
              disabled={!isConnected || !isContractDeployed}
              variant="outline"
            >
              刷新余额
            </Button>
            <Button
              onClick={withdraw}
              disabled={!isConnected || isWithdrawing || !isContractDeployed}
              variant="default"
            >
              {isWithdrawing ? '提款中...' : '我要提款'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 