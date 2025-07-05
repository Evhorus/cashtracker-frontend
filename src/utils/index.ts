export const formatCurrency = (quantity: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(quantity);
};

export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return formatter.format(date);
};
