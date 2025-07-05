"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Todo, timestampToDate } from "@/lib/contract";

interface TodoListProps {
  todoList: Todo[];
  isLoading: boolean;
  isContractDeployed: boolean;
  refreshList: () => Promise<void>;
}

export function TodoList({
  todoList,
  isLoading,
  isContractDeployed,
  refreshList
}: TodoListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-base">消息列表</CardTitle>
        <Button
          onClick={refreshList}
          disabled={!isContractDeployed}
          variant="outline"
          size="sm"
        >
          刷新
        </Button>
      </CardHeader>
      <CardContent>
        {!isContractDeployed ? (
          <div className="py-4 text-center text-gray-500">
            演示模式下无法显示消息列表，请部署合约并更新配置
          </div>
        ) : isLoading ? (
          <div className="py-4 text-center text-gray-500">加载中...</div>
        ) : todoList.length === 0 ? (
          <div className="py-4 text-center text-gray-500">暂无消息</div>
        ) : (
          <div className="space-y-2">
            {todoList.map((todo) => (
              <div key={todo.id} className="rounded-md border border-gray-200 p-2">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">ID: {todo.id}</span>
                  <span className="text-xs text-gray-500">{timestampToDate(parseInt(todo.timestamp))}</span>
                </div>
                <div className="mt-1 text-xs text-gray-700">
                  <span className="text-gray-500">发布者: </span>
                  <span className="font-mono">{todo.author}</span>
                </div>
                <div className="mt-1 text-sm">{todo.message}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 