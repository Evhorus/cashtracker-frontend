import { useEffect, useState, type ChangeEvent } from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { Input } from './ui/input';
import { formatNumber, parseNumericValue } from '@/shared/lib/format-currency';

export interface PriceInputProps<T extends FieldValues> {
  value: string | undefined;
  onChange: ControllerRenderProps<T>['onChange'];
}

export function PriceInput<T extends FieldValues>({
  value,
  onChange,
  ...field
}: PriceInputProps<T>) {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === undefined || value === '') {
      setDisplayValue('');
      return;
    }
    
    const num = parseNumericValue(value);
    if (num > 0) {
      setDisplayValue(formatNumber(num));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanedValue = rawValue.replace(/\D/g, ''); // Remover todo excepto dígitos

    if (cleanedValue === '') {
      setDisplayValue('');
      onChange('');
      return;
    }

    const numberValue = Number(cleanedValue);
    setDisplayValue(formatNumber(numberValue));
    onChange(cleanedValue);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
        $
      </span>
      <Input
        {...field}
        type="text"
        inputMode="numeric"
        className="pl-8"
        value={displayValue}
        onChange={handleChange}
        placeholder="0"
        autoComplete="off"
      />
    </div>
  );
}
