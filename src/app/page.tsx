import { Header } from '@/components/Header';
import { Todo } from '@/components/Todo';
import { DeployContract } from '@/components/DeployContract';
import { ContractStatus } from '@/components/ContractStatus';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-2 py-3">
        <DeployContract />
        <ContractStatus />
      </div>
      <Todo />
    </main>
  );
}
