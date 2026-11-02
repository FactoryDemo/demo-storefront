/** Format a cents amount as a display currency string, e.g. 1234 -> "$12.34". */
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}
