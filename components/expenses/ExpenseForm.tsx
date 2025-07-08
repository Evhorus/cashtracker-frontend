'use client'
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ExpenseFormInputs } from '@/src/schemas';
import { ErrorMessage } from '../ui/ErrorMessage';

type ExpenseFormProps = {
  register: UseFormRegister<ExpenseFormInputs>;
  errors: FieldErrors<ExpenseFormInputs>;
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  register,
  errors,
}) => {
  return (
    <>
      <div className="mb-5">
        <label htmlFor="name" className="text-sm uppercase font-bold">
          Nombre Gasto
        </label>
        <input
          id="name"
          className="w-full p-3  border border-gray-100  bg-white"
          type="text"
          placeholder="Nombre del Gasto"
          {...register('name')}
        />
        {errors && errors.name && (
          <ErrorMessage>{errors.name.message}</ErrorMessage>
        )}
      </div>

      <div className="mb-5">
        <label htmlFor="amount" className="text-sm uppercase font-bold">
          Cantidad Gasto
        </label>
        <input
          id="amount"
          className="w-full p-3  border border-gray-100 bg-white"
          type="number"
          placeholder="Cantidad Gasto"
          {...register('amount')}
        />
        {errors && errors.amount && (
          <ErrorMessage>{errors.amount.message}</ErrorMessage>
        )}
      </div>
    </>
  );
};
