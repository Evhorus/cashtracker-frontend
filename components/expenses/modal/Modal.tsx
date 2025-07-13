'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ModalContext } from '@/src/contexts/modal-context';
import { Expense } from '@/src/schemas';

interface ModalProps {
  children: React.ReactNode;
  expense: Expense | null;
}

export const Modal: React.FC<ModalProps> = ({ expense, children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const showModal = !!searchParams.get('showModal');

  const closeModal = () => {
    const hideModal = new URLSearchParams(searchParams.toString());
    Array.from(hideModal.entries()).forEach(([key]) => {
      hideModal.delete(key);
    });
    router.replace(`${pathname}?${hideModal}`);
  };

  const value = {
    expense,
    closeModal,
    showModal,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
