export const formatAmount = (
  amountInCents: number | null,
  currency: string | null,
) => {
  if (amountInCents === null || amountInCents === undefined) return '-';
  const amount = amountInCents / 100;
  if (!currency) return amount.toFixed(2);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};
