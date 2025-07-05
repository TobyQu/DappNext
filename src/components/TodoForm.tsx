"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TodoFormProps {
  isConnected: boolean;
  isContractDeployed: boolean;
  isLoading: boolean;
  publishMessage: (message: string) => Promise<void>;
}

export function TodoForm({
  isConnected,
  isContractDeployed,
  isLoading,
  publishMessage
}: TodoFormProps) {
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async () => {
    if (!message.trim()) return;
    await publishMessage(message);
    setMessage('');
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">发布新消息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="请输入消息内容"
            className="h-20 w-full"
            maxLength={50}
            disabled={!isContractDeployed}
          />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{message.length}/50</span>
            <Button
              onClick={handleSubmit}
              disabled={!isConnected || !message || isLoading || !isContractDeployed}
              size="sm"
            >
              {isLoading ? '发布中...' : '发布消息'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 