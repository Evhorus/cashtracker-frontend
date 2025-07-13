import { createContext } from 'react';
import { Expense } from '../schemas';

export interface ModalContextValue {
  expense: Expense | null;
  showModal: boolean;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | undefined>(
  undefined,
);
