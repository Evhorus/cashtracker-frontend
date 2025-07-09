'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/Button';

export const AddExpenseButton: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => router.push(pathname + '?addExpense=true&showModal=true')}
    >
      Agregar gasto
    </Button>
  );
};
