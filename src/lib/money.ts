export function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function clampNonNegativeNumber(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}
