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
      <div className="space-y-3">
        <label htmlFor="name" className="text-sm uppercase font-bold">
          Nombre Presupuesto
        </label>
        <input
          id="name"
          className="w-full p-3  border border-gray-100 bg-slate-100"
          type="text"
          placeholder="Nombre del Presupuesto"
          {...register('name')}
        />
        {errors && errors.name && (
          <ErrorMessage>{errors.name.message}</ErrorMessage>
        )}
      </div>
      <div className="space-y-3">
        <label htmlFor="amount" className="text-sm uppercase font-bold">
          Cantidad Presupuesto
        </label>
        <input
          type="number"
          id="amount"
          className="w-full p-3  border border-gray-100 bg-slate-100"
          placeholder="Cantidad Presupuesto"
          {...register('amount')}
        />
        {errors && errors.amount && (
          <ErrorMessage>{errors.amount.message}</ErrorMessage>
        )}
      </div>
    </>
  );
};
