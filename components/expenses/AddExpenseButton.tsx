'use client';
import { usePathname, useRouter } from 'next/navigation';

export const AddExpenseButton: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      className="bg-amber-500 px-10 py-2 rounded-lg text-white font-bld cursor-pointer"
      onClick={() => router.push(pathname + '?addExpense=true&showModal=true')}
    >
      Agregar gasto
    </button>
  );
};
