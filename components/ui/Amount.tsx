import { formatCurrency } from '@/src/utils';
import React from 'react';

type AmountProps = {
  label: string;
  amount: number;
};

export const Amount: React.FC<AmountProps> = ({ label, amount }) => {
  return (
    <p className="text-2xl font-bold">
      {label}: {''}
      <span className="text-amber-500">{formatCurrency(amount)}</span>
    </p>
  );
};
