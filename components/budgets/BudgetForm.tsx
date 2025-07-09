import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ErrorMessage } from '../ui/ErrorMessage';
import { BudgetFormInputs } from '@/src/schemas';

type BudgetFormProps = {
  register: UseFormRegister<BudgetFormInputs>;
  errors: FieldErrors<BudgetFormInputs>;
};

export const BudgetForm: React.FC<BudgetFormProps> = ({ register, errors }) => {
  return (
    <>
      <div className="mb-5">
        <label htmlFor="name" className="text-sm uppercase font-bold">
          Nombre del Presupuesto
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
          Cantidad del Presupuesto
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
