import { Todo } from '@/components/Todo';
import { DeployContract } from '@/components/DeployContract';
import { ContractStatus } from '@/components/ContractStatus';

export default function Home() {
  return (
    <main>
      <div className="container mx-auto px-2 py-3">
        <DeployContract />
        <ContractStatus />
      </div>
      <Todo />
    </main>
  );
}
