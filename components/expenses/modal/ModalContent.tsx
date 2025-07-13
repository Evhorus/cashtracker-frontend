'use client';
import { Fragment } from 'react';
import {
  Transition,
  Dialog,
  TransitionChild,
  DialogPanel,
} from '@headlessui/react';
import { useSearchParams } from 'next/navigation';

import { AddExpenseForm } from './forms/AddExpenseForm';
import { DeleteExpenseForm } from './forms/DeleteExpenseForm';
import { EditExpenseForm } from './forms/EditExpenseForm';
import { useModal } from '@/src/hooks/use-modal';

const componentsMap = {
  AddExpense: AddExpenseForm,
  EditExpense: EditExpenseForm,
  DeleteExpense: DeleteExpenseForm,
};

export const ModalContent: React.FC = () => {
  const searchParams = useSearchParams();
  const { showModal, closeModal } = useModal();

  let componentName: keyof typeof componentsMap | null = null;
  if (searchParams.get('addExpense')) componentName = 'AddExpense';
  if (searchParams.get('editExpenseId')) componentName = 'EditExpense';
  if (searchParams.get('deleteExpenseId')) componentName = 'DeleteExpense';

  const ComponentToRender = componentName ? componentsMap[componentName] : null;

  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all p-8 sm:p-16">
                {ComponentToRender ? <ComponentToRender /> : null}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
