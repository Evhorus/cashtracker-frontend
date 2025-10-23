export const formatCurrency = (quantity: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(quantity);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-CO').format(value);
};

export const parseNumericValue = (value: string | number | undefined): number => {
  if (value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  
  // Remover puntos de miles y convertir a número
  const cleanedValue = value.replace(/\./g, '');
  return Number(cleanedValue) || 0;
};
