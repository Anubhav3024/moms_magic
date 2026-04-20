export const DEFAULT_PAYMENT_CURRENCY = "INR";

export function normalizeCurrency(value?: string): string {
  const normalized = String(value || DEFAULT_PAYMENT_CURRENCY)
    .trim()
    .toUpperCase();
  if (!normalized) return DEFAULT_PAYMENT_CURRENCY;
  return normalized;
}

export function amountToMinorUnits(amount: number): number {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new Error("Invalid amount");
  }
  return Math.round(numeric * 100);
}

export function expectedReservationAmountMinorUnits(
  totalAmount: number,
): number {
  return amountToMinorUnits(totalAmount);
}

export function hasExactAmountAndCurrencyMatch(input: {
  expectedAmount: number;
  expectedCurrency: string;
  actualAmount: number;
  actualCurrency: string;
}): boolean {
  const expectedCurrency = normalizeCurrency(input.expectedCurrency);
  const actualCurrency = normalizeCurrency(input.actualCurrency);
  return (
    Number.isInteger(input.expectedAmount) &&
    Number.isInteger(input.actualAmount) &&
    input.expectedAmount === input.actualAmount &&
    expectedCurrency === actualCurrency
  );
}

export function computeReservationAdvanceAmount(input: {
  seats: number;
  advanceAmountPerPerson: number;
}): number {
  const seats = Number.isFinite(input.seats)
    ? Math.max(1, Math.floor(input.seats))
    : 1;
  const perPerson = Number.isFinite(input.advanceAmountPerPerson)
    ? Math.max(0, input.advanceAmountPerPerson)
    : 0;
  return seats * perPerson;
}
