export function normalizeCommissionRate(rate) {
  const number = Number(rate);
  return Number.isFinite(number) ? number : 0;
}

export function calculateCommission(margin, rate) {
  const marginNumber = Number(margin);
  if (!Number.isFinite(marginNumber)) return 0;

  return marginNumber * (normalizeCommissionRate(rate) / 100);
}

export function commissionLabel(rate) {
  const normalizedRate = normalizeCommissionRate(rate);
  return `${normalizedRate}% commission`;
}
